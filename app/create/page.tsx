"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  X as XIcon,
} from "lucide-react";
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
  status: OrderStatus;
  image_url: string | null;
  accepted: boolean;
  done: boolean;
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
      amount: 100,
      status: "normal",
      image_url: null,
      accepted: false,
      done: false,
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: number]: boolean;
  }>({});

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
        delivery_type: "to deliver",
        amount: 1,
        status: "normal",
        image_url: null,
        accepted: false,
        done: false,
      },
    ]);
  };

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index));
  };

  const getOrdersText = (n: number) => {
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "заказов";
    if (lastDigit === 1) return "заказ";
    if (lastDigit >= 2 && lastDigit <= 4) return "заказа";
    return "заказов";
  };

  const updateOrder = (index: number, field: keyof OrderForm, value: any) => {
    const newOrders = [...orders];
    newOrders[index] = { ...newOrders[index], [field]: value };
    setOrders(newOrders);
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите изображение");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Изображение должно быть меньше 5МБ");
      return;
    }

    setUploadingImages((prev) => ({ ...prev, [index]: true }));

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

        updateOrder(index, "image_url", base64String);
        setUploadingImages((prev) => ({ ...prev, [index]: false }));
      };

      img.onerror = () => {
        alert("Не удалось загрузить изображение");
        setUploadingImages((prev) => ({ ...prev, [index]: false }));
      };

      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        alert("Не удалось прочитать изображение");
        setUploadingImages((prev) => ({ ...prev, [index]: false }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Не удалось загрузить изображение");
      setUploadingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  const removeImage = (index: number) => {
    updateOrder(index, "image_url", null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Пожалуйста, введите название группы");
      return;
    }

    setSaving(true);

    try {
      const group = await createOrderGroup(groupName);

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
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b-2 border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-stone-900">
                Создать группу заказов
              </h1>
              <p className="text-sm text-stone-500">
                {orders.length} {getOrdersText(orders.length)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              Название группы *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="напр., Неделя 6-12 февраля"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
              required
            />
          </div>

          {/* Orders */}
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-stone-900">
                    Заказ №{index + 1}
                  </h3>
                  {orders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOrder(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">
                        Дата принятия
                      </label>
                      <input
                        type="date"
                        value={order.date_accepted}
                        onChange={(e) =>
                          updateOrder(index, "date_accepted", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">
                        Дата доставки
                      </label>
                      <input
                        type="date"
                        value={order.date_delivery}
                        onChange={(e) =>
                          updateOrder(index, "date_delivery", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                      />
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Имя клиента
                    </label>
                    <input
                      type="text"
                      value={order.customer_name}
                      onChange={(e) =>
                        updateOrder(index, "customer_name", e.target.value)
                      }
                      placeholder="Введите имя клиента"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                    />
                  </div>

                  {/* Order Source */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Источник заказа
                    </label>
                    <input
                      type="text"
                      value={order.order_source}
                      onChange={(e) =>
                        updateOrder(index, "order_source", e.target.value)
                      }
                      placeholder="напр., Instagram, Facebook, Лично"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                    />
                  </div>

                  {/* Phrase */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Фраза на брелке
                    </label>
                    <input
                      type="text"
                      value={order.phrase}
                      onChange={(e) =>
                        updateOrder(index, "phrase", e.target.value)
                      }
                      placeholder="Текст для гравировки"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                    />
                  </div>

                  {/* Keychain Type & Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">
                        Тип брелка
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
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900 bg-white"
                      >
                        <option value="GH">GH</option>
                        <option value="2G">2G</option>
                        <option value="Coupled">Coupled</option>
                        <option value="Square">Square</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">
                        Количество
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={order.amount}
                        onChange={(e) =>
                          updateOrder(
                            index,
                            "amount",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Статус
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrder(
                          index,
                          "status",
                          e.target.value as OrderStatus,
                        )
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-semibold"
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
                      }}
                    >
                      <option
                        value="critical"
                        style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                      >
                        🔴 Критический
                      </option>
                      <option
                        value="normal"
                        style={{ backgroundColor: "#FED7AA", color: "#9A3412" }}
                      >
                        🟠 Обычный
                      </option>
                      <option
                        value="done"
                        style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                      >
                        🟢 Готово
                      </option>
                    </select>
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Тип доставки
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
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900 bg-white"
                    >
                      <option value="to deliver">Доставка</option>
                      <option value="comes and takes">Самовывоз</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Адрес
                    </label>
                    <textarea
                      value={order.address}
                      onChange={(e) =>
                        updateOrder(index, "address", e.target.value)
                      }
                      placeholder={
                        order.delivery_type === "to deliver"
                          ? "Введите адрес доставки"
                          : "Необязательно"
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-stone-900 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      Фото брелка (Необязательно)
                    </label>
                    {order.image_url ? (
                      <div className="relative">
                        <img
                          src={order.image_url}
                          alt="Keychain preview"
                          className="w-full h-48 object-cover rounded-xl border-2 border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(index, file);
                          }}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-xl hover:border-orange-500 transition-colors cursor-pointer bg-stone-100"
                        >
                          {uploadingImages[index] ? (
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

                  {/* Checkboxes */}
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={order.accepted}
                        onChange={(e) =>
                          updateOrder(index, "accepted", e.target.checked)
                        }
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
                        onChange={(e) =>
                          updateOrder(index, "done", e.target.checked)
                        }
                        className="w-5 h-5 rounded border-2 border-stone-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-sm text-stone-900">
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
            className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 bg-white text-stone-900 border-2 border-stone-200 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить еще один заказ
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Создание..." : "Создать группу заказов"}
          </button>
        </form>
      </main>
    </div>
  );
}
