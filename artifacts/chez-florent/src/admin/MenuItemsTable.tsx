import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext, PointerSensor, KeyboardSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getGetMenuQueryKey, useReorderMenuItems, type MenuCategory, type MenuItem,
} from "@workspace/api-client-react";
import { moveMenuItem, sameMenuOrder } from "../lib/menuOrder";
import { IconButton } from "./ui";

function ItemRow({ item, index, count, disabled, disableActions, onEdit, onDelete, onMove }: {
  item: MenuItem; index: number; count: number; disabled: boolean;
  disableActions: boolean;
  onEdit: (item: MenuItem) => void; onDelete: (item: MenuItem) => void;
  onMove: (id: number, direction: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: disabled || count < 2 });
  return (
    <tr ref={setNodeRef} data-item-id={item.id}
      style={{ transform: CSS.Transform.toString(transform), transition, position: "relative", zIndex: isDragging ? 1 : undefined }}
      className={`border-t border-border/70 align-middle ${isDragging ? "bg-bg-tertiary shadow-lg" : "hover:bg-bg-tertiary/30"}`}>
      <td className="py-2.5 pr-2">
        <div className="flex items-center gap-1">
          <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
            aria-label={`Déplacer ${item.name}`} disabled={disabled || count < 2}
            className="touch-none shrink-0 w-10 h-11 rounded-md border border-border text-cream-soft cursor-grab active:cursor-grabbing disabled:opacity-30 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-orange">
            <svg aria-hidden="true" className="mx-auto" width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
              {[5, 10, 15].map((y) => <g key={y}><circle cx="5" cy={y} r="1.5" /><circle cx="11" cy={y} r="1.5" /></g>)}
            </svg>
          </button>
          <div className="flex flex-col">
            <button type="button" aria-label={`Monter ${item.name}`} disabled={disableActions || index === 0}
              onClick={() => onMove(item.id, -1)}
              className="h-6 w-6 text-cream-soft disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-orange">↑</button>
            <button type="button" aria-label={`Descendre ${item.name}`} disabled={disableActions || index === count - 1}
              onClick={() => onMove(item.id, 1)}
              className="h-6 w-6 text-cream-soft disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-orange">↓</button>
          </div>
        </div>
      </td>
      <td className="py-2.5 pr-2">
        <div className="h-11 w-11 overflow-hidden rounded-md border border-border bg-bg-tertiary">
          {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
        </div>
      </td>
      <td className="py-2.5 pr-3 min-w-32">
        <div className="font-medium text-cream">{item.name}</div>
        <div className="line-clamp-1 text-xs text-cream-soft/55">{item.description}</div>
      </td>
      <td className="py-2.5 font-serif text-orange whitespace-nowrap">{item.price}</td>
      <td className="py-2.5 pr-1 text-right">
        <div className="inline-flex items-center gap-1.5">
          <IconButton label="Modifier le plat" disabled={disableActions} onClick={() => onEdit(item)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </IconButton>
          <IconButton label="Supprimer le plat" disabled={disableActions}
            className="border-red-400/30 text-red-300 hover:border-red-400/60" onClick={() => onDelete(item)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </IconButton>
        </div>
      </td>
    </tr>
  );
}

export default function MenuItemsTable({ category, onEdit, onDelete, onBusyChange, externalBusy }: {
  category: MenuCategory; onEdit: (item: MenuItem) => void; onDelete: (item: MenuItem) => void;
  onBusyChange: (busy: boolean) => void;
  externalBusy: boolean;
}) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(category.items);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const locked = useRef(false);
  const dragLocked = useRef(false);
  const reorder = useReorderMenuItems();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!locked.current && !dragLocked.current) setItems(category.items);
  }, [category.items, saving, dragging]);

  async function saveOrder(next: MenuItem[]) {
    if (locked.current || dragLocked.current || sameMenuOrder(items, next)) return;
    locked.current = true;
    setSaving(true);
    onBusyChange(true);
    const previous = items;
    setItems(next);
    setError("");
    setStatus("Enregistrement de l’ordre…");
    try {
      // Stop older reads from overwriting the response of this mutation.
      await queryClient.cancelQueries({ queryKey: getGetMenuQueryKey() });
      const saved = await reorder.mutateAsync({
        id: category.id,
        data: { itemIds: next.map((item) => item.id), expectedItemIds: previous.map((item) => item.id) },
      });
      setItems(saved.items);
      queryClient.setQueryData<MenuCategory[]>(getGetMenuQueryKey(), (menu) =>
        menu?.map((entry) => entry.id === saved.id ? saved : entry));
      setStatus("Ordre enregistré.");
    } catch (cause) {
      setItems(previous);
      const apiError = cause as { data?: { error?: string } };
      setError(apiError.data?.error ?? "Impossible d’enregistrer l’ordre. L’ordre précédent a été restauré; réessayez.");
      setStatus("Échec de l’enregistrement. Ordre précédent restauré.");
    } finally {
      // Remain locked until refreshed server data replaces optimistic state.
      await queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey() });
      locked.current = false;
      setSaving(false);
      onBusyChange(false);
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    dragLocked.current = false;
    setDragging(false);
    onBusyChange(false);
    if (over) void saveOrder(moveMenuItem(items, Number(active.id), Number(over.id)));
    else setStatus("Déplacement annulé.");
  }

  return (
    <div className="mt-3">
      <p className="text-xs text-cream-soft/60 mb-2">
        Glissez la poignée pour réordonner les plats. Au clavier : espace, flèches, puis espace pour confirmer; Échap pour annuler.
      </p>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-orange mb-1">{status}</p>
      {error && <p role="alert" className="text-sm text-red-300 mb-2">{error}</p>}
      <div className="overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          accessibility={{
            screenReaderInstructions: { draggable: "Pour déplacer un plat, appuyez sur espace, utilisez les flèches puis espace pour enregistrer. Échap annule." },
            announcements: {
              onDragStart: ({ active }) => `Déplacement de ${items.find((item) => item.id === active.id)?.name}.`,
              onDragOver: ({ over }) => over ? `Position ${items.findIndex((item) => item.id === over.id) + 1} sur ${items.length}.` : "Hors de la liste.",
              onDragEnd: ({ over }) => over ? "Déplacement terminé." : "Déplacement annulé.",
              onDragCancel: () => "Déplacement annulé.",
            },
          }}
          onDragStart={() => { dragLocked.current = true; setDragging(true); onBusyChange(true); setStatus("Déplacement en cours…"); }}
          onDragCancel={() => { dragLocked.current = false; setDragging(false); onBusyChange(false); setStatus("Déplacement annulé."); }}
          onDragEnd={onDragEnd}>
          <table className="w-full text-sm" aria-label={`Plats de ${category.label}`}>
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-[0.16em] text-cream-soft/45">
                <th className="w-20 py-2 font-semibold">Ordre</th>
                <th className="w-14 py-2 font-semibold"><span className="sr-only">Photo</span></th>
                <th className="py-2 font-semibold">Plat</th>
                <th className="w-28 py-2 font-semibold">Prix</th>
                <th className="w-20 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {items.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-cream-soft/50">Aucun plat dans cette catégorie.</td></tr>}
                {items.map((item, index) => <ItemRow key={item.id} item={item} index={index} count={items.length}
                  disabled={saving || externalBusy} disableActions={saving || dragging || externalBusy}
                  onEdit={onEdit} onDelete={onDelete}
                  onMove={(id, direction) => {
                    const neighbor = items[index + direction];
                    if (neighbor) void saveOrder(moveMenuItem(items, id, neighbor.id));
                  }} />)}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
