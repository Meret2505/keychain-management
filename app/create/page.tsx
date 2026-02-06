"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { KeychainType, DeliveryType, OrderStatus } from "@/types";
import { createOrderGroup, createOrder } from "../actions";

interface OrderForm {
  date_accepted: string;
  date_delivery: string;
  customer_name: string;
  order_source: string;
  phrase: string;
  keychain_type: KeychainType;
  address: string;
  delivery_type: DeliveryType;
  amount: number;
  accepted: boolean;
  done: boolean;
  status: OrderStatus;
}

export default function CreatePage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [orders, setOrders] = useState<OrderForm[]>([
    {
      date_accepted: new Date().toISOString().split("T")[0],
      date_delivery: "",
      customer_name: "",
      order_source: "",
      phrase: "",
      keychain_type: "GH",
      address: "",
      delivery_type: "to deliver",
      amount: 1,
      accepted: false,
      done: false,
      status: "normal",
    },
  ]);
  const [saving, setSaving] = useState(false);

  const addOrder = () => {
    setOrders([
      ...orders,
      {
        date_accepted: new Date().toISOString().split("T")[0],
        date_delivery: "",
        customer_name: "",
        order_source: "",
        phrase: "",
        keychain_type: "GH",
        address: "",
        status: "normal",
        delivery_type: "to deliver",
        amount: 1,
        accepted: false,
        done: false,
      },
    ]);
  };

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index));
  };

  const updateOrder = (index: number, field: keyof OrderForm, value: any) => {
    const newOrders = [...orders];
    newOrders[index] = { ...newOrders[index], [field]: value };
    setOrders(newOrders);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert("Пожалуйста, введите название группы");
      return;
    }

    if (orders.length === 0) {
      alert("Пожалуйста, добавьте хотя бы один заказ");
      return;
    }

    setSaving(true);

    try {
      // Create the group
      const group = await createOrderGroup(groupName);

      // Create all orders
      await Promise.all(
        orders.map((order) =>
          createOrder({
            ...order,
            group_id: group.id,
          }),
        ),
      );

      router.push(`/group/${group.id}`);
    } catch (error) {
      console.error("Error creating orders:", error);
      alert("Не удалось создать заказы. Пожалуйста, попробуйте еще раз.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-1 -ml-1 hover:bg-gray-100 rounded transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Создать группу заказов
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Group Name */}
          <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <label className="block text-xs font-bold text-gray-900 mb-2">
              Название группы *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="напр., Неделя 6-12 февраля"
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              required
            />
          </div>

          {/* Orders */}
          <div className="space-y-3">
            {orders.map((order, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Заказ #{index + 1}
                  </h3>
                  {orders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOrder(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Dates Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Дата принятия *
                      </label>
                      <input
                        type="date"
                        value={order.date_accepted}
                        onChange={(e) =>
                          updateOrder(index, "date_accepted", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Дата доставки *
                      </label>
                      <input
                        type="date"
                        value={order.date_delivery}
                        onChange={(e) =>
                          updateOrder(index, "date_delivery", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Имя клиента *
                    </label>
                    <input
                      type="text"
                      value={order.customer_name}
                      onChange={(e) =>
                        updateOrder(index, "customer_name", e.target.value)
                      }
                      placeholder="Введите имя клиента"
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                    />
                  </div>

                  {/* Order Source */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Источник заказа *
                    </label>
                    <input
                      type="text"
                      value={order.order_source}
                      onChange={(e) =>
                        updateOrder(index, "order_source", e.target.value)
                      }
                      placeholder="напр., Instagram, Facebook, Лично"
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                    />
                  </div>

                  {/* Phrase */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Что гравировать *
                    </label>
                    <input
                      type="text"
                      value={order.phrase}
                      onChange={(e) =>
                        updateOrder(index, "phrase", e.target.value)
                      }
                      placeholder="Текст для гравировки"
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                    />
                  </div>

                  {/* Keychain Type & Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Тип кольча *
                      </label>
                      <select
                        value={order.keychain_type}
                        onChange={(e) =>
                          updateOrder(
                            index,
                            "keychain_type",
                            e.target.value as KeychainType,
                          )
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      >
                        <option value="GH">GH</option>
                        <option value="2G">2G</option>
                        <option value="Coupled">Coupled</option>
                        <option value="Square">Square</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Количество *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={order.amount}
                        onChange={(e) =>
                          updateOrder(
                            index,
                            "amount",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Status *</label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrder(
                          index,
                          "status",
                          e.target.value as OrderStatus,
                        )
                      }
                      className="input-field"
                      style={{
                        backgroundColor:
                          order.status === "critical"
                            ? "#FEE2E2"
                            : order.status === "done"
                              ? "#D1FAE5"
                              : "#FED7AA",
                        color:
                          order.status === "critical"
                            ? "#991B1B"
                            : order.status === "done"
                              ? "#065F46"
                              : "#9A3412",
                        fontWeight: "600",
                      }}
                      required
                    >
                      <option
                        value="critical"
                        style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                      >
                        🔴 Critical
                      </option>
                      <option
                        value="normal"
                        style={{ backgroundColor: "#FED7AA", color: "#9A3412" }}
                      >
                        🟠 Normal
                      </option>
                      <option
                        value="done"
                        style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                      >
                        🟢 Done
                      </option>
                    </select>
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Тип доставки *
                    </label>
                    <select
                      value={order.delivery_type}
                      onChange={(e) =>
                        updateOrder(
                          index,
                          "delivery_type",
                          e.target.value as DeliveryType,
                        )
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      required
                    >
                      <option value="to deliver">Нести и доставить</option>
                      <option value="comes and takes">
                        Клиент دелает заказ
                      </option>
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Адрес {order.delivery_type === "to deliver" && "*"}
                    </label>
                    <textarea
                      value={order.address}
                      onChange={(e) =>
                        updateOrder(index, "address", e.target.value)
                      }
                      placeholder={
                        order.delivery_type === "to deliver"
                          ? "Введите адрес доставки"
                          : "Опционально"
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
                      rows={2}
                      required={order.delivery_type === "to deliver"}
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 border-t border-gray-200">
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={order.accepted}
                        onChange={(e) =>
                          updateOrder(index, "accepted", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-2 border-gray-300 text-orange-500 cursor-pointer"
                      />
                      <span className="font-semibold text-xs text-gray-700 group-hover:text-orange-600 transition-colors">
                        Принято
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={order.done}
                        onChange={(e) =>
                          updateOrder(index, "done", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-2 border-gray-300 text-green-500 cursor-pointer"
                      />
                      <span className="font-semibold text-xs text-gray-700 group-hover:text-green-600 transition-colors">
                        Готово
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Order Button */}
          <button
            type="button"
            onClick={addOrder}
            className="w-full py-2 px-4 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить еще один заказ
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 px-4 text-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Создать группу заказов"}
          </button>
        </form>
      </main>
    </div>
  );
}
