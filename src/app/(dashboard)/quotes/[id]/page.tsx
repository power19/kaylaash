import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer } from "lucide-react";
import { formatUsd, formatSrd, convertUsdToSrd } from "@/lib/currency";
import { QuoteActions } from "./quote-actions";

async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          variant: {
            include: {
              product: { include: { brand: true } },
              literVariation: true,
            },
          },
        },
      },
    },
  });
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{quote.quoteNumber}</h1>
              <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(quote.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <QuoteActions quote={quote} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{quote.customer.name}</p>
            {quote.customer.companyName && (
              <p className="text-muted-foreground">{quote.customer.companyName}</p>
            )}
            {quote.customer.email && <p>{quote.customer.email}</p>}
            {quote.customer.phone && <p>{quote.customer.phone}</p>}
            {quote.customer.address && (
              <p className="text-muted-foreground">{quote.customer.address}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quote Number</span>
              <span>{quote.quoteNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
            </div>
            {quote.validUntil && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until</span>
                <span>{new Date(quote.validUntil).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span>$1 = {formatSrd(quote.exchangeRate)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatUsd(quote.totalUsd)}
            </div>
            <div className="text-xl text-blue-600">
              {formatSrd(convertUsdToSrd(quote.totalUsd, quote.exchangeRate))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price (USD)</TableHead>
                <TableHead className="text-right">Unit Price (SRD)</TableHead>
                <TableHead className="text-right">Total (USD)</TableHead>
                <TableHead className="text-right">Total (SRD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item) => {
                const totalUsd = item.quantity * item.unitPriceUsd;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {item.variant.product.brand.name} -{" "}
                          {item.variant.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.variant.literVariation.label}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatUsd(item.unitPriceUsd)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatSrd(convertUsdToSrd(item.unitPriceUsd, quote.exchangeRate))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(totalUsd)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatSrd(convertUsdToSrd(totalUsd, quote.exchangeRate))}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatUsd(quote.totalUsd)}
                </TableCell>
                <TableCell className="text-right font-bold text-blue-600">
                  {formatSrd(convertUsdToSrd(quote.totalUsd, quote.exchangeRate))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{quote.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
