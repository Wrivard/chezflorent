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
  Badge,
  Button,
  Card,
  ErrorText,
  Field,
  IconButton,
  Modal,
  SectionHeading,
  SectionPreview,
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

function ItemForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
  pending,
  error,
}: {
  initial: ItemDraft;
  onSubmit: (draft: ItemDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
  pending: boolean;
  error: unknown;
}) {
  const [draft, setDraft] = useState<ItemDraft>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  async function onFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImage(file);
      setDraft((d) => ({ ...d, image: url }));
    } catch (err) {
      setUploadError(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom du plat">
          <TextInput
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <Field label="Prix" hint="ex. « 16,95 $ »">
          <TextInput
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream-soft/60">
            Photo du plat
          </span>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-tertiary">
              {draft.image ? (
                <img
                  src={draft.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-cream-soft transition-colors hover:text-cream hover:border-cream-soft/40">
              {uploading ? "Téléversement…" : "Choisir une image"}
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
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onSubmit(draft)}
            disabled={pending || uploading || !draft.name}
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        </div>
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>
            Supprimer
          </Button>
        )}
      </div>
      <ErrorText error={error} />
    </div>
  );
}

type ItemModalState =
  | { mode: "closed" }
  | { mode: "create"; categoryId: number; nextSortOrder: number }
  | { mode: "edit"; item: MenuItem };

function CategorySection({ category }: { category: MenuCategory }) {
  const invalidate = useMenuInvalidate();
  const [editCat, setEditCat] = useState(false);
  const [itemModal, setItemModal] = useState<ItemModalState>({ mode: "closed" });

  const [label, setLabel] = useState(category.label);
  const [slug, setSlug] = useState(category.slug);
  const [tagline, setTagline] = useState(category.tagline);

  const updateCat = useUpdateMenuCategory({
    mutation: { onSuccess: () => { invalidate(); setEditCat(false); } },
  });
  const removeCat = useDeleteMenuCategory({ mutation: { onSuccess: invalidate } });

  const createItem = useCreateMenuItem({
    mutation: { onSuccess: () => { invalidate(); setItemModal({ mode: "closed" }); } },
  });
  const updateItem = useUpdateMenuItem({
    mutation: { onSuccess: () => { invalidate(); setItemModal({ mode: "closed" }); } },
  });
  const removeItem = useDeleteMenuItem({
    mutation: { onSuccess: () => { invalidate(); setItemModal({ mode: "closed" }); } },
  });

  const nextItemSort =
    category.items.length > 0
      ? Math.max(...category.items.map((i) => i.sortOrder)) + 1
      : 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl text-cream">{category.label}</h3>
            <Badge>{category.items.length} plat{category.items.length > 1 ? "s" : ""}</Badge>
          </div>
          {category.tagline && (
            <p className="mt-1 max-w-xl text-sm italic text-cream-soft/60">
              {category.tagline}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="subtle" onClick={() => setEditCat((v) => !v)}>
            {editCat ? "Fermer" : "Modifier la catégorie"}
          </Button>
          <IconButton
            label="Supprimer la catégorie"
            className="border-red-400/30 text-red-300 hover:border-red-400/60"
            onClick={() => {
              if (
                confirm(
                  `Supprimer la catégorie « ${category.label} » et tous ses plats ?`,
                )
              )
                removeCat.mutate({ id: category.id });
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </IconButton>
        </div>
      </div>

      {editCat && (
        <div className="border-b border-border bg-bg-tertiary/30 px-1 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom de la catégorie">
              <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
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
          </div>
          <div className="mt-3">
            <Button
              onClick={() =>
                updateCat.mutate({
                  id: category.id,
                  data: { label, slug, tagline, sortOrder: category.sortOrder },
                })
              }
              disabled={updateCat.isPending}
            >
              {updateCat.isPending ? "…" : "Enregistrer la catégorie"}
            </Button>
          </div>
          <ErrorText error={updateCat.error} />
        </div>
      )}

      {/* Items table */}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[0.65rem] uppercase tracking-[0.16em] text-cream-soft/45">
              <th className="w-14 py-2 pl-1 font-semibold"></th>
              <th className="py-2 font-semibold">Plat</th>
              <th className="w-28 py-2 font-semibold">Prix</th>
              <th className="w-20 py-2 text-right font-semibold pr-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {category.items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-cream-soft/50">
                  Aucun plat dans cette catégorie.
                </td>
              </tr>
            )}
            {category.items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-border/70 align-middle transition-colors hover:bg-bg-tertiary/30"
              >
                <td className="py-2.5 pl-1">
                  <div className="h-11 w-11 overflow-hidden rounded-md border border-border bg-bg-tertiary">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <div className="font-medium text-cream">{item.name}</div>
                  <div className="line-clamp-1 text-xs text-cream-soft/55">
                    {item.description}
                  </div>
                </td>
                <td className="py-2.5 font-serif text-orange">{item.price}</td>
                <td className="py-2.5 pr-1 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <IconButton
                      label="Modifier le plat"
                      onClick={() => setItemModal({ mode: "edit", item })}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </IconButton>
                    <IconButton
                      label="Supprimer le plat"
                      className="border-red-400/30 text-red-300 hover:border-red-400/60"
                      onClick={() => {
                        if (confirm(`Supprimer « ${item.name} » ?`))
                          removeItem.mutate({ id: item.id });
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Button
          variant="subtle"
          onClick={() =>
            setItemModal({
              mode: "create",
              categoryId: category.id,
              nextSortOrder: nextItemSort,
            })
          }
        >
          + Ajouter un plat à « {category.label} »
        </Button>
      </div>

      <Modal
        open={itemModal.mode === "create"}
        onClose={() => setItemModal({ mode: "closed" })}
        title={`Nouveau plat — ${category.label}`}
      >
        {itemModal.mode === "create" && (
          <ItemForm
            initial={{
              name: "",
              price: "",
              description: "",
              image: "",
              sortOrder: itemModal.nextSortOrder,
            }}
            onSubmit={(draft) =>
              createItem.mutate({
                data: {
                  categoryId: itemModal.categoryId,
                  ...draft,
                  image: draft.image || null,
                },
              })
            }
            onCancel={() => setItemModal({ mode: "closed" })}
            pending={createItem.isPending}
            error={createItem.error}
          />
        )}
      </Modal>

      <Modal
        open={itemModal.mode === "edit"}
        onClose={() => setItemModal({ mode: "closed" })}
        title="Modifier le plat"
      >
        {itemModal.mode === "edit" && (
          <ItemForm
            key={itemModal.item.id}
            initial={{
              name: itemModal.item.name,
              price: itemModal.item.price,
              description: itemModal.item.description,
              image: itemModal.item.image ?? "",
              sortOrder: itemModal.item.sortOrder,
            }}
            onSubmit={(draft) =>
              updateItem.mutate({
                id: itemModal.item.id,
                data: { ...draft, image: draft.image || null },
              })
            }
            onCancel={() => setItemModal({ mode: "closed" })}
            onDelete={() => {
              if (confirm(`Supprimer « ${itemModal.item.name} » ?`))
                removeItem.mutate({ id: itemModal.item.id });
            }}
            pending={updateItem.isPending || removeItem.isPending}
            error={updateItem.error ?? removeItem.error}
          />
        )}
      </Modal>
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

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Ajouter une catégorie</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle catégorie">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom de la catégorie">
            <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
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
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() =>
              create.mutate({
                data: { label, slug, tagline, sortOrder: nextSortOrder },
              })
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
      </Modal>
    </>
  );
}

export default function MenuEditor() {
  const { data: menu, isLoading, isError, error } = useGetMenu();

  if (isLoading) return <p className="text-cream-soft/60">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  const categories = menu ?? [];
  const nextSortOrder =
    categories.length > 0
      ? Math.max(...categories.map((c) => c.sortOrder)) + 1
      : 0;

  return (
    <div>
      <SectionHeading
        eyebrow="L'ardoise"
        title="Menu du restaurant"
        description="Chaque catégorie a son tableau. Ajoutez, modifiez ou retirez les plats directement dans la bonne section."
        action={<AddCategory nextSortOrder={nextSortOrder} />}
      />
      <div className="space-y-6">
        {categories.length === 0 && (
          <p className="text-cream-soft/60">
            Aucune catégorie. Commencez par en ajouter une.
          </p>
        )}
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>

      <SectionPreview
        section="menu"
        title="La section « Menu » du site"
        description="Voici à quoi ressemble votre ardoise sur la page publique."
      />
    </div>
  );
}
