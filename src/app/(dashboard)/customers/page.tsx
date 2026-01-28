import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./customers-client";

async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { quotes: true, invoices: true },
      },
    },
  });
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>
      <CustomersClient initialCustomers={customers} />
    </div>
  );
}
