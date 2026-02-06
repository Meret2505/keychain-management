"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, ChevronRight, Package, Calendar } from "lucide-react";
import { OrderGroup } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { getOrderGroups } from "./actions";

export default function HomePage() {
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    loadOrderGroups();
  }, []);

  async function loadOrderGroups() {
    setLoading(true);
    const groups = await getOrderGroups();
    setOrderGroups(groups);
    setLoading(false);
  }

  const filteredGroups = orderGroups.filter((group) => {
    if (filter === "all") return true;
    const hasActiveOrders = group.orders?.some((o) => !o.done);
    const hasCompletedOrders = group.orders?.some((o) => o.done);

    if (filter === "active") return hasActiveOrders;
    if (filter === "completed") return hasCompletedOrders && !hasActiveOrders;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Заказы Брелков
              </h1>
              <p className="text-xs text-gray-500 mt-1 ml-2">
                {orderGroups.length}{" "}
                {orderGroups.length === 1 ? "группа" : "групп"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </button>
              <Link
                href="/create"
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Новый</span>
              </Link>
            </div>
          </div>

          {/* Filter Menu */}
          {showFilterMenu && (
            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300 ${
                    filter === "all"
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-400/30"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300 ${
                    filter === "active"
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-400/30"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  Активные
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300 ${
                    filter === "completed"
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-400/30"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  Готово
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Заказов еще нет
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Создайте первую группу заказов, чтобы начать
            </p>
            <Link
              href="/create"
              className="px-6 py-4 text-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Создать группу заказов
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => {
              const totalOrders = group.orders?.length || 0;
              const completedOrders =
                group.orders?.filter((o) => o.done).length || 0;
              const progress =
                totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

              return (
                <Link
                  key={group.id}
                  href={`/group/${group.id}`}
                  className="block group"
                >
                  <div
                    className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full animate-in fade-in slide-in-from-bottom-3 duration-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(group.created_at), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 group-hover:text-orange-500 transition-all" />
                    </div>

                    {/* Progress Bar */}
                    {totalOrders > 0 && (
                      <div className="mb-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span className="font-semibold">
                            {completedOrders} из {totalOrders} готово
                          </span>
                          <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 transition-all duration-700 rounded-full shadow-lg shadow-orange-500/30"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-2 text-xs pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-500"></div>
                        <span className="font-semibold text-gray-700">
                          {totalOrders}{" "}
                          {totalOrders === 1 ? "заказ" : "заказов"}
                        </span>
                      </div>
                      {completedOrders > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-semibold text-gray-700">
                            {completedOrders} готово
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
