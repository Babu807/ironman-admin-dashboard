import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HubAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");

  const LIMIT = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      loadadmins();
    }, 400); // debounce

    return () => clearTimeout(timer);
  }, [page, search]);


  const loadadmins = async () => {
    const token = localStorage.getItem("token");
      setLoading(true);

    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/users/hub-admins?search=${encodeURIComponent(
        search
      )}&page=${page}&limit=${LIMIT}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (res) => {
        if (res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.status && Array.isArray(data.data)) {
          setAdmins(data.data);
          setPagination(data.pagination);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Stage Summary Fetch Error:", err);
        setLoading(false);
      });
  };

  const updateUserStatus = async (userId, status) => {
    const token = localStorage.getItem("token");

    let json = {
      status: status,
      id: userId
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/crm/users/update/userstatus`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      }
    );

    return res.json();
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold
      ${status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"}
    `}
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );

  const Loader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
  </div>
);



  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      {/* HEADER + SEARCH */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Hub Admins</h2>

        <input
          type="text"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm w-64
                     focus:outline-none focus:ring focus:ring-gray-300"
        />
      </div>

      {/* LOADING */}
      {loading ? (
       <Loader/>
      ) : (
        <>
          {/* TABLE */}
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                {["S.No", "Name", "Email", "Phone", "Status", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-3 text-left text-sm font-semibold text-gray-700"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {!admins.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500"
                  >
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((p, index) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3 text-sm">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.email}</td>
                    <td className="p-3">{p.phone_number}</td>

                    <td className="p-3">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* ACTION TOGGLE */}
                    <td className="p-3">
                      <Switch
                        checked={p.status === "active"}
                        disabled={updatingId === p.id}
                        onChange={async (checked) => {
                          const oldStatus = p.status;
                          const newStatus = checked ? "active" : "inactive";

                          setUpdatingId(p.id);

                          // optimistic UI
                          setAdmins((prev) =>
                            prev.map((u) =>
                              u.id === p.id
                                ? { ...u, status: newStatus }
                                : u
                            )
                          );

                          try {
                            const res = await updateUserStatus(
                              p.id,
                              newStatus
                            );

                            if (!res?.status) {
                              throw new Error("Update failed");
                            }

                            toast.success(
                              `User ${newStatus === "active"
                                ? "activated"
                                : "deactivated"
                              } successfully`
                            );
                          } catch {
                            // rollback
                            setAdmins((prev) =>
                              prev.map((u) =>
                                u.id === p.id
                                  ? { ...u, status: oldStatus }
                                  : u
                              )
                            );
                            toast.error("Failed to update user status");
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full
                          ${p.status === "active"
                            ? "bg-green-600"
                            : "bg-gray-300"}
                          transition-colors
                          ${updatingId === p.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""}
                        `}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                            ${p.status === "active"
                              ? "translate-x-6"
                              : "translate-x-1"}
                          `}
                        />
                      </Switch>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`w-9 h-9 flex items-center justify-center rounded-full border
                ${page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-gray-700"}
              `}
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm text-gray-600 w-20 text-center">
              {pagination.page || 1} / {pagination.totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, pagination.totalPages || p)
                )
              }
              disabled={page === pagination.totalPages}
              className={`w-9 h-9 flex items-center justify-center rounded-full border
                ${page === pagination.totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-gray-700"}
              `}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HubAdmins;
