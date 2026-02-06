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

export default function GroupDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [group, setGroup] = useState<OrderGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Order>>({});

  useEffect(() => {
    loadGroup();
  }, [params.id]);

  async function loadGroup() {
    setLoading(true);
    const groups = await getOrderGroups();
    const foundGroup = groups.find((g) => g.id === params.id);
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
    if (
      !confirm("Вы уверены, что хотите удалить всю группу со всеми заказами?")
    )
      return;

    try {
      await deleteOrderGroup(params.id);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Группа не найдена
          </h2>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="p-1 -ml-1 hover:bg-gray-100 rounded transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {format(new Date(group.created_at), "MMMM dd, yyyy")}
              </p>
            </div>
            <button
              onClick={handleDeleteGroup}
              className="p-1 -mr-1 text-red-500 hover:bg-red-50 rounded transition-all duration-200"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          {orders.length > 0 && (
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-semibold text-xs">
                  {completedCount} из {orders.length} готово
                </span>
                <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">
                  {Math.round((completedCount / orders.length) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 transition-all duration-700 rounded-full shadow-lg shadow-orange-500/30"
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
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Нет заказов в этой группе
            </h2>
            <p className="text-gray-500">Это не должно было произойти!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {orders.map((order, index) => {
              const isEditing = editingOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-500"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-base text-gray-900">
                          {order.customer_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${
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
                            ? "🔴 Critical"
                            : order.status === "done"
                              ? "🟢 Done"
                              : "🟠 Normal"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 italic font-medium">
                        "{order.phrase}"
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(order)}
                        className="p-1 hover:bg-gray-100 rounded transition-all duration-200 ml-2 flex-shrink-0"
                      >
                        <Edit2 className="w-4 h-4 text-orange-500" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 border-t-2 border-gray-200 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-900 mb-1">
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
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-900 mb-1">
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
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">
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
                          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">
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
                          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">
                          Фраза
                        </label>
                        <input
                          type="text"
                          value={editForm.phrase || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phrase: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-900 mb-1">
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
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                          >
                            <option value="GH">GH</option>
                            <option value="2G">2G</option>
                            <option value="Coupled">Coupled</option>
                            <option value="Square">Square</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-900 mb-1">
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
                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label text-xs">Status</label>
                        <select
                          value={editForm.status || "normal"}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              status: e.target.value as OrderStatus,
                            })
                          }
                          className="input-field text-sm py-2"
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
                            fontWeight: "600",
                          }}
                        >
                          <option
                            value="critical"
                            style={{
                              backgroundColor: "#FEE2E2",
                              color: "#991B1B",
                            }}
                          >
                            🔴 Critical
                          </option>
                          <option
                            value="normal"
                            style={{
                              backgroundColor: "#FED7AA",
                              color: "#9A3412",
                            }}
                          >
                            🟠 Normal
                          </option>
                          <option
                            value="done"
                            style={{
                              backgroundColor: "#D1FAE5",
                              color: "#065F46",
                            }}
                          >
                            🟢 Done
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">
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
                          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        >
                          <option value="to deliver">Несть и доставить</option>
                          <option value="comes and takes">
                            Клиент делает заказ
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">
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
                          className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEdit}
                          className="flex-1 py-2 px-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Сохранить
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg transition-all hover:bg-gray-200 flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-500 text-xs font-medium mb-0.5">
                              Принято
                            </p>
                            <p className="font-bold text-gray-900 text-xs">
                              {format(new Date(order.date_accepted), "MMM dd")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-500 text-xs font-medium mb-0.5">
                              Доставка
                            </p>
                            <p className="font-bold text-gray-900 text-xs">
                              {format(new Date(order.date_delivery), "MMM dd")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs font-medium mb-1">
                            {order.delivery_type}
                          </p>
                          {order.address && (
                            <p className="font-semibold text-gray-900 text-xs">
                              {order.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-gray-900">
                            {order.amount}TMT
                          </span>
                        </div>
                        <div className="text-gray-600 font-medium text-xs">
                          из {order.order_source}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={order.accepted}
                            onChange={() => toggleCheckbox(order, "accepted")}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-orange-500 cursor-pointer"
                          />
                          <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                            Принято
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={order.done}
                            onChange={() => toggleCheckbox(order, "done")}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-green-500 cursor-pointer"
                          />
                          <span className="font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                            Готово
                          </span>
                        </label>
                      </div>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="w-full mt-1 py-1 text-red-600 hover:bg-red-50 rounded transition-all font-semibold text-xs hover:shadow-md"
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
