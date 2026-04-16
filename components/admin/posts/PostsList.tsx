"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import PostsForm, { PostFormValues } from "./PostsForm";
import type { Post, PostImage, PostListItem } from "@/types/posts";

import {
  Edit3,
  Plus,
  Trash2,
  Image as ImageIcon,
  Search,
  Eye,
  EyeOff,
  Calendar,
  Tag,
} from "lucide-react";

const POSTS_COLUMNS = [
  "id",
  "title",
  "slug",
  "category",
  "views",
  "published",
  "created_at",
].join(", ");

export default function PostsList() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* FETCH */
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("posts")
        .select(POSTS_COLUMNS)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsData = (data ?? []) as unknown as PostListItem[];

      const postsWithCounts = postsData.map((post) => ({
        ...post,
        sectionsCount: 0,
      }));

      if (postsWithCounts.length) {
        const { data: sections } = await supabase
          .from("post_images")
          .select("post_id")
          .in(
            "post_id",
            postsWithCounts.map((post) => post.id),
          );

        const counter = new Map<string, number>();

        const sectionsData = (sections ?? []) as unknown as PostImage[];

        sectionsData.forEach(({ post_id }) => {
          counter.set(post_id, (counter.get(post_id) ?? 0) + 1);
        });

        setPosts(
          postsWithCounts.map((post) => ({
            ...post,
            sectionsCount: counter.get(post.id) ?? 0,
          })),
        );
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error(error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /* LOAD EDIT */
  const loadPostForEditing = async (post: PostListItem) => {
    setLoadingEditId(post.id);

    try {
      const { data: postData } = await supabase
        .from("posts")
        .select("*")
        .eq("id", post.id)
        .single();

      const { data: sections } = await supabase
        .from("post_images")
        .select("*")
        .eq("post_id", post.id)
        .order("image_order", { ascending: true });

      setEditing({
        ...postData,
        post_images: (sections ?? []) as PostImage[],
      });

      setFormOpen(true);
    } catch (error: any) {
      alert(error?.message ?? "Không thể tải Tin tức");
    } finally {
      setLoadingEditId(null);
    }
  };

  /* SEARCH */
  const filteredPosts = useMemo(() => {
    if (!search) return posts;
    const query = search.toLowerCase();

    return posts.filter((post) =>
      (`${post.title} ${post.slug} ${post.category ?? ""}`)
        .toLowerCase()
        .includes(query),
    );
  }, [posts, search]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("vi-VN");

  /* CREATE / UPDATE */
  const handleCreateOrUpdate = async (values: PostFormValues) => {
    setSaving(true);

    try {
      const tagsArray = values.tags
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        slug: values.slug.trim(),
        title: values.title.trim(),
        category: values.category || null,
        tags: tagsArray?.length ? tagsArray : null,
        published: values.published,
      };

      let postId = editing?.id;

      if (editing) {
        await supabase.from("posts").update(payload).eq("id", editing.id);
      } else {
        const { data } = await supabase
          .from("posts")
          .insert([payload])
          .select("id");

        postId = data?.[0]?.id ?? null;
      }

      if (postId) {
        const sectionsPayload = values.sections.map((section, index) => ({
          post_id: postId,
          image_url: section.image_url.trim(),
          image_order: index,
        }));

        if (editing) {
          await supabase
            .from("post_images")
            .delete()
            .eq("post_id", postId);
        }

        if (sectionsPayload.length) {
          await supabase.from("post_images").insert(sectionsPayload);
        }
      }

      await fetchPosts();

      setFormOpen(false);
      setEditing(null);
    } catch (error: any) {
      alert(error?.message ?? "Không thể lưu Tin tức");
    } finally {
      setSaving(false);
    }
  };

  /* TOGGLE */
  const togglePublish = async (post: PostListItem) => {
    await supabase
      .from("posts")
      .update({ published: !post.published })
      .eq("id", post.id);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, published: !p.published } : p,
      ),
    );
  };

  /* DELETE */
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);

    await supabase.from("posts").delete().eq("id", deleteId);

    setPosts((prev) => prev.filter((p) => p.id !== deleteId));

    setDeleteId(null);
    setDeleteLoading(false);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex w-full items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm Tin tức..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm"
        >
          <Plus size={16} />
          Thêm
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-card animate-pulse border border-border" />
          ))}
        </div>
      )}

      {/* GRID */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {filteredPosts.map((post) => (

            <div
              key={post.id}
              className={`
                group relative rounded-2xl border border-border bg-card/60 p-4
                hover:border-primary/40 transition-all
                ${!post.published ? "opacity-60 grayscale" : ""}
              `}
            >

              <div className="space-y-3">

                {/* TITLE */}
                <div>
                  <p className="font-semibold truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /{post.slug}
                  </p>
                </div>

                {/* META */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">

                  <span className="flex items-center gap-1">
                    <Tag size={13} />
                    {post.category || "—"}
                  </span>

                  <span className="flex items-center gap-1">
                    <ImageIcon size={13} />
                    {post.sectionsCount ?? 0}
                  </span>

                  <span className="flex items-center gap-1">
                    <Eye size={13} />
                    {post.views}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {formatDate(post.created_at)}
                  </span>

                </div>

                {/* ACTION */}
                <div className="flex gap-2 pt-2 border-t">

                  <button
                    onClick={() => togglePublish(post)}
                    className={`flex items-center gap-1 px-3 h-8 rounded-xl text-xs border ${
                      post.published
                        ? "text-green-500 border-green-400 bg-green-500/10"
                        : "text-gray-500 border-border"
                    }`}
                  >
                    {post.published ? <Eye size={13} /> : <EyeOff size={13} />}
                    {post.published ? "Public" : "Nháp"}
                  </button>

                  <button
                    onClick={() => loadPostForEditing(post)}
                    className="flex-1 flex items-center justify-center gap-1 border px-3 h-8 rounded-xl text-xs"
                  >
                    <Edit3 size={13} />
                    Sửa
                  </button>

                  <button
                    onClick={() => setDeleteId(post.id)}
                    className="flex items-center px-3 h-8 rounded-xl border border-red-400 text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* FORM */}
      <PostsForm
        open={formOpen}
        initial={editing ?? undefined}
        loading={saving}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />

      {/* DELETE */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xóa Tin tức"
        description="Hành động này không thể hoàn tác."
        loading={deleteLoading}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}