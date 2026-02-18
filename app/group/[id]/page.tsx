"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Trash2,
  Calendar,
  MapPin,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import {
  OrderGroup,
  Order,
  KeychainType,
  DeliveryType,
  OrderStatus,
} from "@/types";
import {
  getOrderGroups,
  updateOrder,
  deleteOrder,
  deleteOrderGroup,
} from "../../actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<OrderGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadGroup();
  }, [id]);

  async function loadGroup() {
    setLoading(true);
    const groups = await getOrderGroups();
    const foundGroup = groups.find((g) => g.id === id);
    setGroup(foundGroup || null);
    setLoading(false);
  }

  const startEdit = (order: Order) => {
    setEditingOrder(order.id);
    setEditForm(order);
  };

  const cancelEdit = () => {
    setEditingOrder(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingOrder) return;

    try {
      await updateOrder(editingOrder, editForm);
      setEditingOrder(null);
      setEditForm({});
      loadGroup();
    } catch (error) {
      alert("Failed to update order");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот заказ?")) return;

    try {
      await deleteOrder(orderId);
      loadGroup();
    } catch (error) {
      alert("Не удалось удалить заказ");
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("Вы уверены, что хотите удалить всю группу и все ее заказы?"))
      return;

    try {
      await deleteOrderGroup(id);
      router.push("/");
    } catch (error) {
      alert("Не удалось удалить группу");
    }
  };

  const toggleCheckbox = async (order: Order, field: "accepted" | "done") => {
    try {
      await updateOrder(order.id, { [field]: !order[field] });
      loadGroup();
    } catch (error) {
      alert("Failed to update order");
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Изображение должно быть меньше 5МБ");
      return;
    }

    setUploadingImage(true);

    try {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        const base64String = canvas.toDataURL("image/jpeg", 0.7);

        setEditForm({ ...editForm, image_url: base64String });
        setUploadingImage(false);
      };

      img.onerror = () => {
        alert("Не удалось загрузить изображение");
        setUploadingImage(false);
      };

      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        alert("Не удалось прочитать изображение");
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Не удалось загрузить изображение");
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setEditForm({ ...editForm, image_url: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 text-stone-900">
            Группа не найдена
          </h2>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const orders = group.orders || [];
  const completedCount = orders.filter((o) => o.done).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b-2 border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/"
              className="p-2 -ml-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-900">{group.name}</h1>
              <p className="text-sm text-stone-500">
                {format(new Date(group.created_at), "d MMMM yyyy 'г.'", {
                  locale: ru,
                })}
              </p>
            </div>
            <button
              onClick={handleDeleteGroup}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          {orders.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span>
                  {completedCount} из {orders.length} готово
                </span>
                <span className="font-semibold text-stone-700">
                  {Math.round((completedCount / orders.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                  style={{
                    width: `${(completedCount / orders.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Orders */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-stone-400 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-stone-900">
              No orders in this group
            </h2>
            <p className="text-stone-500">This shouldn't happen!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const isEditing = editingOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 transition-all duration-200"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-stone-900">
                          {order.customer_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            order.keychain_type === "GH"
                              ? "bg-blue-100 text-blue-700"
                              : order.keychain_type === "2G"
                                ? "bg-purple-100 text-purple-700"
                                : order.keychain_type === "Coupled"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-green-100 text-green-700"
                          }`}
                        >
                          {order.keychain_type}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === "critical"
                              ? "bg-red-100 text-red-700"
                              : order.status === "done"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {order.status === "critical"
                            ? "🔴 Критический"
                            : order.status === "done"
                              ? "🟢 Готово"
                              : "🟠 Обычный"}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 italic mb-2">
                        "{order.phrase}"
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(order)}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-orange-500" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 border-t-2 border-stone-200 pt-4">
                      {/* Image Upload in Edit Mode */}
                      <div>
                        <label className="block text-stone-600 font-medium text-sm mb-1">
                          Фото брелка
                        </label>
                        {editForm.image_url ? (
                          <div className="relative">
                            <img
                              src={editForm.image_url}
                              alt="Keychain preview"
                              className="w-full h-48 object-cover rounded-xl border-2 border-stone-200"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                              }}
                              className="hidden"
                              id="edit-image-upload"
                            />
                            <label
                              htmlFor="edit-image-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-xl hover:border-orange-500 transition-colors cursor-pointer bg-stone-100"
                            >
                              {uploadingImage ? (
                                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <ImageIcon className="w-8 h-8 text-stone-400 mb-2" />
                                  <span className="text-sm text-stone-500">
                                    Нажмите, чтобы загрузить фото
                                  </span>
                                  <span className="text-xs text-stone-400 mt-1">
                                    Макс. 5МБ
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-600 font-medium text-sm mb-1">
                            Дата принятия
                          </label>
                          <input
                            type="date"
                            value={editForm.date_accepted || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                date_accepted: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-600 font-medium text-sm mb-1">
                            Дата доставки
                          </label>
                          <input
                            type="date"
                            value={editForm.date_delivery || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                date_delivery: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-600 font-medium text-sm mb-1">
                          Имя клиента
                        </label>
                        <input
                          type="text"
                          value={editForm.customer_name || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              customer_name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-600 font-medium text-sm mb-1">
                          Источник заказа
                        </label>
                        <input
                          type="text"
                          value={editForm.order_source || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              order_source: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-600 font-medium text-sm mb-1">
                          Фраза
                        </label>
                        <input
                          type="text"
                          value={editForm.phrase || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phrase: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-600 font-medium text-sm mb-1">
                            Тип
                          </label>
                          <select
                            value={editForm.keychain_type || "GH"}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                keychain_type: e.target.value as KeychainType,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900 bg-white"
                          >
                            <option value="GH">GH</option>
                            <option value="2G">2G</option>
                            <option value="Coupled">Coupled</option>
                            <option value="Square">Square</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-stone-600 font-medium text-sm mb-1">
                            Количество
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.amount || 1}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                amount: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-600 font-medium text-sm mb-1">
                          Статус
                        </label>
                        <select
                          value={editForm.status || "normal"}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              status: e.target.value as OrderStatus,
                            })
                          }
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-semibold"
                          style={{
                            backgroundColor:
                              editForm.status === "critical"
                                ? "#FEE2E2"
                                : editForm.status === "done"
                                  ? "#D1FAE5"
                                  : "#FED7AA",
                            color:
                              editForm.status === "critical"
                                ? "#991B1B"
                                : editForm.status === "done"
                                  ? "#065F46"
                                  : "#9A3412",
                          }}
                        >
                          <option
                            value="critical"
                            style={{
                              backgroundColor: "#FEE2E2",
                              color: "#991B1B",
                            }}
                          >
                            🔴 Критический
                          </option>
                          <option
                            value="normal"
                            style={{
                              backgroundColor: "#FED7AA",
                              color: "#9A3412",
                            }}
                          >
                            🟠 Обычный
                          </option>
                          <option
                            value="done"
                            style={{
                              backgroundColor: "#D1FAE5",
                              color: "#065F46",
                            }}
                          >
                            🟢 Готово
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-600 font-medium text-sm mb-1">
                          Тип доставки
                        </label>
                        <select
                          value={editForm.delivery_type || "to deliver"}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              delivery_type: e.target.value as DeliveryType,
                            })
                          }
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900 bg-white"
                        >
                          <option value="to deliver">Доставка</option>
                          <option value="comes and takes">Самовывоз</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-600 font-medium text-sm mb-1">
                          Адрес
                        </label>
                        <textarea
                          value={editForm.address || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900 resize-none"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEdit}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Сохранить
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Image Display in View Mode */}
                      {order.image_url && (
                        <div className="mb-4">
                          <img
                            src={order.image_url}
                            alt="Keychain"
                            className="w-full h-48 object-cover rounded-xl border-2 border-stone-200"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-stone-500 text-xs">Принято</p>
                            <p className="font-semibold text-stone-900">
                              {format(new Date(order.date_accepted), "d MMM", {
                                locale: ru,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-stone-500 text-xs">Доставка</p>
                            <p className="font-semibold text-stone-900">
                              {format(new Date(order.date_delivery), "d MMM", {
                                locale: ru,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-stone-500 text-xs mb-1">
                            {order.delivery_type === "to deliver"
                              ? "Доставка"
                              : "Самовывоз"}
                          </p>
                          {order.address && (
                            <p className="font-medium text-stone-900">
                              {order.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm pt-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-stone-400" />
                          <span className="font-semibold text-stone-900">
                            {order.amount}TMT
                          </span>
                        </div>
                        <div className="text-stone-500">
                          от {order.order_source}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-3 border-t border-stone-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={order.accepted}
                            onChange={() => toggleCheckbox(order, "accepted")}
                            className="w-5 h-5 rounded border-2 border-stone-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="font-semibold text-sm text-stone-900">
                            Принят
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={order.done}
                            onChange={() => toggleCheckbox(order, "done")}
                            className="w-5 h-5 rounded border-2 border-stone-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-sm text-stone-900">
                            Готово
                          </span>
                        </label>
                      </div>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="w-full mt-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                      >
                        Удалить заказ
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
