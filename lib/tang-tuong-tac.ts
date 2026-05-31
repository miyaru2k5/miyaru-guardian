// lib/tang-tuong-tac.ts

import { supabase } from "@/lib/supabase"; // đổi thành import db của bạn nếu khác

export interface TuongTacService {
    id: number;
    social: string;
    service: string;
    server_order: string;
    name: string;
    prices: number;
    refund_fees: number;
    detail: string;
    reaction: string;
    min_order: number;
    max_order: number;
    status: "on" | "off";
}

export interface ServiceListResponse {
    status: "success" | "error";
    data: TuongTacService[];
}

// ── Hằng số ──────────────────────────────────────────────────────────────────
const PRICE_MARKUP = 1.3; // +30%

// ── Gọi external API ─────────────────────────────────────────────────────────
async function fetchFromExternalAPI(): Promise<TuongTacService[]> {
    const formData = new FormData();
    formData.append(
        "apikey",
        process.env.LIKENHANH_API_KEY || "2y10EAyyR7xMuWb0lhctPPeOMesi9Dy3mqyY6wOJgyYz5QvXkmB4Zji"
    );

    const res = await fetch("https://likenhanh.pro/api/service/list", {
        method: "POST",
        body: formData,
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`Lỗi kết nối API: ${res.status}`);

    const json: ServiceListResponse = await res.json();
    if (json.status !== "success") throw new Error("API trả về lỗi");

    return json.data;
}

// ── Đọc cache từ DB ───────────────────────────────────────────────────────────
async function getCachedData(): Promise<TuongTacService[] | null> {
    const { data, error } = await supabase
        .from("system_settings")
        .select("topsubre")
        .single();

    if (error || !data?.topsubre) return null;
    return data.topsubre as TuongTacService[];
}

// ── Lưu data mới vào DB ───────────────────────────────────────────────────────
async function saveToCache(data: TuongTacService[]): Promise<void> {
    await supabase
        .from("system_settings")
        .update({ topsubre: data })
        .eq("id", 1); // hoặc điều kiện row của bạn
}

// ── So sánh data cũ và mới ────────────────────────────────────────────────────
// So sánh nhanh bằng JSON string — đủ dùng cho array object
function hasChanged(oldData: TuongTacService[], newData: TuongTacService[]): boolean {
    return JSON.stringify(oldData) !== JSON.stringify(newData);
}

// ── Apply +30% giá ────────────────────────────────────────────────────────────
function applyMarkup(data: TuongTacService[]): TuongTacService[] {
    return data.map((item) => ({
        ...item,
        prices: item.prices * PRICE_MARKUP,
    }));
}

// ── Main function ─────────────────────────────────────────────────────────────
export async function getServiceList(): Promise<ServiceListResponse> {
    // 1. Gọi external API lấy data mới nhất
    const freshData = await fetchFromExternalAPI();

    // 2. Đọc cache từ DB
    const cachedData = await getCachedData();

    // 3. Nếu data thay đổi → update DB
    if (!cachedData || hasChanged(cachedData, freshData)) {
        await saveToCache(freshData); // lưu giá gốc, không lưu giá đã markup
    }

    // 4. Trả về data với giá +30%
    return {
        status: "success",
        data: applyMarkup(freshData),
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function groupBySocial(
    data: TuongTacService[]
): Record<string, TuongTacService[]> {
    return data.reduce<Record<string, TuongTacService[]>>((acc, item) => {
        if (!acc[item.social]) acc[item.social] = [];
        acc[item.social].push(item);
        return acc;
    }, {});
}

export function groupByService(
    data: TuongTacService[]
): Record<string, TuongTacService[]> {
    return data.reduce<Record<string, TuongTacService[]>>((acc, item) => {
        if (!acc[item.service]) acc[item.service] = [];
        acc[item.service].push(item);
        return acc;
    }, {});
}

export function formatPrice(price: number): string {
    return price.toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    });
}

export function formatNumber(n: number): string {
    return n.toLocaleString("vi-VN");
}