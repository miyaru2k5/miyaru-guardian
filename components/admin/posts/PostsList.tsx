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

  // FETCH POSTS
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

  // LOAD EDIT
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

  // SEARCH
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

  // CREATE / UPDATE
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

  // TOGGLE PUBLISH
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

  // DELETE
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

        {/* SEARCH */}
<div className="relative flex-1">

  <Search
    size={16}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
  />

  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Tìm Tin tức..."
    className="
      w-full
      rounded-xl
      border border-border
      bg-background
      text-foreground
      placeholder:text-muted-foreground
      pl-9 pr-3 py-2
      text-sm
      outline-none
      transition
      focus:ring-2
      focus:ring-primary
      focus:border-primary
    "
  />

</div>

        {/* BUTTON */}

        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Thêm Tin tức</span>
          <span className="sm:hidden">Thêm</span>
        </button>

      </div>

      {/* MOBILE CARD */}

      <div className="space-y-3 md:hidden">

        {filteredPosts.map((post) => (

          <div
            key={post.id}
            className="border rounded-xl p-4 space-y-2"
          >

            <div className="flex justify-between">

              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  /{post.slug}
                </p>
              </div>

              <button
                onClick={() => togglePublish(post)}
                className={`px-2 py-1 rounded-full text-xs ${post.published
                    ? "bg-green-500/10 text-green-600"
                    : "bg-gray-400/10 text-gray-500"
                  }`}
              >
                {post.published ? "Published" : "Draft"}
              </button>

            </div>

            <div className="flex flex-wrap gap-3 text-xs">

              <span className="flex items-center gap-1">
                <Tag size={14} />
                {post.category || "—"}
              </span>

              <span className="flex items-center gap-1">
                <ImageIcon size={14} />
                {post.sectionsCount ?? 0}
              </span>

              <span className="flex items-center gap-1">
                <Eye size={14} />
                {post.views}
              </span>

              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(post.created_at)}
              </span>

            </div>

            <div className="flex gap-2 pt-2">

              <button
                onClick={() => loadPostForEditing(post)}
                className="flex items-center gap-1 border rounded px-2 py-1 text-xs"
              >
                <Edit3 size={14} />
                Sửa
              </button>

              <button
                onClick={() => setDeleteId(post.id)}
                className="flex items-center gap-1 border border-red-400 text-red-500 rounded px-2 py-1 text-xs"
              >
                <Trash2 size={14} />
                Xóa
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* DESKTOP TABLE */}

      <div className="hidden md:block border rounded-xl">

        <table className="w-full text-sm">

          <thead className="bg-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Tin tức</th>
              <th className="px-4 py-3 text-left">Danh mục</th>
              <th className="px-4 py-3 text-center">Ảnh</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>

          <tbody>

            {filteredPosts.map((post) => (

              <tr key={post.id} className="border-t hover:bg-muted/40">

                <td className="px-4 py-3">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /{post.slug}
                  </p>
                </td>

                <td className="px-4 py-3">{post.category || "—"}</td>

                <td className="px-4 py-3 text-center">
                  {post.sectionsCount ?? 0}
                </td>

                <td className="px-4 py-3 text-right">
                  {post.views}
                </td>

                <td className="px-4 py-3 text-center">

                  <button
                    onClick={() => togglePublish(post)}
                    className={`px-3 py-1 rounded-full text-xs ${post.published
                        ? "bg-green-500/10 text-green-600"
                        : "bg-gray-400/10 text-gray-500"
                      }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </button>

                </td>

                <td className="px-4 py-3">
                  {formatDate(post.created_at)}
                </td>

                <td className="px-4 py-3 text-right">

                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => loadPostForEditing(post)}
                      className="flex items-center gap-1 border px-2 py-1 rounded text-xs"
                    >
                      <Edit3 size={14} />
                      Sửa
                    </button>

                    <button
                      onClick={() => setDeleteId(post.id)}
                      className="flex items-center gap-1 border border-red-400 text-red-500 px-2 py-1 rounded text-xs"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

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