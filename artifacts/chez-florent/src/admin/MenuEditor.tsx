import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMenu,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  getGetMenuQueryKey,
} from "@workspace/api-client-react";
import type { MenuCategory, MenuItem } from "@workspace/api-client-react";
import {
  Button,
  Card,
  ErrorText,
  Field,
  TextInput,
  Textarea,
} from "./ui";
import { uploadImage } from "./lib";

function useMenuInvalidate() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey() });
}

interface ItemDraft {
  name: string;
  price: string;
  description: string;
  image: string;
  sortOrder: number;
}

function ItemFields({
  draft,
  onChange,
}: {
  draft: ItemDraft;
  onChange: (next: ItemDraft) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  async function onFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImage(file);
      onChange({ ...draft, image: url });
    } catch (err) {
      setUploadError(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Nom">
        <TextInput
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
        />
      </Field>
      <Field label="Prix" hint="ex. « 16,95 $ »">
        <TextInput
          value={draft.price}
          onChange={(e) => onChange({ ...draft, price: e.target.value })}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description">
          <Textarea
            value={draft.description}
            onChange={(e) =>
              onChange({ ...draft, description: e.target.value })
            }
          />
        </Field>
      </div>
      <Field label="Ordre">
        <TextInput
          type="number"
          value={draft.sortOrder}
          onChange={(e) =>
            onChange({ ...draft, sortOrder: Number(e.target.value) })
          }
        />
      </Field>
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
          Image
        </span>
        <div className="flex items-center gap-3">
          {draft.image ? (
            <img
              src={draft.image}
              alt=""
              className="h-12 w-12 rounded object-cover"
            />
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
            {uploading ? "…" : "Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <ErrorText error={uploadError} />
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: MenuItem }) {
  const invalidate = useMenuInvalidate();
  const [draft, setDraft] = useState<ItemDraft>({
    name: item.name,
    price: item.price,
    description: item.description,
    image: item.image ?? "",
    sortOrder: item.sortOrder,
  });

  const update = useUpdateMenuItem({ mutation: { onSuccess: invalidate } });
  const remove = useDeleteMenuItem({ mutation: { onSuccess: invalidate } });

  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <ItemFields draft={draft} onChange={setDraft} />
      <div className="mt-3 flex items-center gap-3">
        <Button
          onClick={() =>
            update.mutate({
              id: item.id,
              data: { ...draft, image: draft.image || null },
            })
          }
          disabled={update.isPending}
        >
          {update.isPending ? "…" : "Enregistrer"}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm(`Supprimer « ${item.name} » ?`))
              remove.mutate({ id: item.id });
          }}
          disabled={remove.isPending}
        >
          Supprimer
        </Button>
      </div>
      <ErrorText error={update.error ?? remove.error} />
    </div>
  );
}

function AddItem({
  categoryId,
  nextSortOrder,
}: {
  categoryId: number;
  nextSortOrder: number;
}) {
  const invalidate = useMenuInvalidate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ItemDraft>({
    name: "",
    price: "",
    description: "",
    image: "",
    sortOrder: nextSortOrder,
  });

  const create = useCreateMenuItem({
    mutation: {
      onSuccess: () => {
        invalidate();
        setOpen(false);
        setDraft({
          name: "",
          price: "",
          description: "",
          image: "",
          sortOrder: nextSortOrder + 1,
        });
      },
    },
  });

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        + Ajouter un plat
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-stone-300 p-4">
      <ItemFields draft={draft} onChange={setDraft} />
      <div className="mt-3 flex items-center gap-3">
        <Button
          onClick={() =>
            create.mutate({
              data: { categoryId, ...draft, image: draft.image || null },
            })
          }
          disabled={create.isPending || !draft.name}
        >
          {create.isPending ? "…" : "Ajouter"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
      <ErrorText error={create.error} />
    </div>
  );
}

function CategoryCard({ category }: { category: MenuCategory }) {
  const invalidate = useMenuInvalidate();
  const [label, setLabel] = useState(category.label);
  const [slug, setSlug] = useState(category.slug);
  const [tagline, setTagline] = useState(category.tagline);
  const [sortOrder, setSortOrder] = useState(category.sortOrder);

  const update = useUpdateMenuCategory({ mutation: { onSuccess: invalidate } });
  const remove = useDeleteMenuCategory({ mutation: { onSuccess: invalidate } });

  const nextItemSort =
    category.items.length > 0
      ? Math.max(...category.items.map((i) => i.sortOrder)) + 1
      : 0;

  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom de la catégorie">
          <TextInput
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>
        <Field label="Identifiant (slug)" hint="lettres minuscules, sans espace">
          <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Sous-titre">
            <TextInput
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Ordre">
          <TextInput
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          onClick={() =>
            update.mutate({
              id: category.id,
              data: { label, slug, tagline, sortOrder },
            })
          }
          disabled={update.isPending}
        >
          {update.isPending ? "…" : "Enregistrer la catégorie"}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (
              confirm(
                `Supprimer la catégorie « ${category.label} » et tous ses plats ?`,
              )
            )
              remove.mutate({ id: category.id });
          }}
          disabled={remove.isPending}
        >
          Supprimer
        </Button>
      </div>
      <ErrorText error={update.error ?? remove.error} />

      <div className="mt-5 space-y-3 border-t border-stone-200 pt-5">
        {category.items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
        <AddItem categoryId={category.id} nextSortOrder={nextItemSort} />
      </div>
    </Card>
  );
}

function AddCategory({ nextSortOrder }: { nextSortOrder: number }) {
  const invalidate = useMenuInvalidate();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");

  const create = useCreateMenuCategory({
    mutation: {
      onSuccess: () => {
        invalidate();
        setOpen(false);
        setLabel("");
        setSlug("");
        setTagline("");
      },
    },
  });

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Ajouter une catégorie</Button>;
  }

  return (
    <Card className="border-dashed">
      <h3 className="mb-4 font-serif text-lg text-stone-900">
        Nouvelle catégorie
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom de la catégorie">
          <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <Field label="Identifiant (slug)">
          <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Sous-titre">
            <TextInput
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </Field>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={() =>
            create.mutate({ data: { label, slug, tagline, sortOrder: nextSortOrder } })
          }
          disabled={create.isPending || !label || !slug}
        >
          {create.isPending ? "…" : "Ajouter"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
      <ErrorText error={create.error} />
    </Card>
  );
}

export default function MenuEditor() {
  const { data: menu, isLoading, isError, error } = useGetMenu();

  if (isLoading) return <p className="text-stone-500">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  const categories = menu ?? [];
  const nextSortOrder =
    categories.length > 0
      ? Math.max(...categories.map((c) => c.sortOrder)) + 1
      : 0;

  return (
    <div className="space-y-5">
      <AddCategory nextSortOrder={nextSortOrder} />
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
