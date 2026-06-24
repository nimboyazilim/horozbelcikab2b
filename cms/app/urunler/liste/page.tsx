'use client';

import { useState, useEffect, Fragment } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { API_BASE_URL_RESIM, API_ENDPOINTS } from '@/config/api';
import api from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/dist/client/components/navigation';
import { Separator } from '@/components/ui/separator';
import UrunMikroSenkron from '@/app/components/urun/urunMikroSenkron';
// Yeni importlar
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
// Tip tanımlaması için interface ekleyelim
interface Kategori {
    id: number;
    [key: string]: any; // Diğer alanlar için genel tip
}

export default function UrunlerListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const columns: ColumnDef<Kategori>[] = [
        {
            accessorKey: "id",
            header: "ID",
            enableColumnFilter: false,
        },
        {
            accessorKey: "resim",
            header: "Resim",
            enableColumnFilter: false,
            cell: ({ row }) => {
                return <Image src={`${API_BASE_URL_RESIM}${row.original.resim}`} alt={row.original.urun_adi} width={32} height={32} className="w-[32px] h-[32px] rounded-lg" />
            }
        },
        {
            accessorKey: "urun_adi",
            header: "Ürün Adı"
        },
        {
            accessorKey: "stok_kodu",
            header: "Stok Kodu"
        },
        {
            accessorKey: "fiyat",
            header: "Fiyat"
        },
        {
            accessorKey: "tip",
            header: "Tip"
        }

    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.urunListe);
            setData(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Veriler yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const breadcrumbData = [
        { name: 'Ürün Listesi', link: '/urunler/liste' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
                <div className='flex flex-row gap-2'>
                    <UrunMikroSenkron />
                    <Link href="/urunler">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Ürün
                        </Button>
                    </Link>
                </div>
            </div>

            <Separator className="my-5" />

            <div className="rounded-md border" style={{ height: 'calc(100vh - 185px)' }}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Fragment key={headerGroup.id}>
                                <TableRow>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.column.getCanFilter() ? (
                                                <Input
                                                    placeholder={`${header.column.columnDef.header} ara...`}
                                                    value={(header.column.getFilterValue() ?? '') as string}
                                                    onChange={(e) =>
                                                        header.column.setFilterValue(e.target.value)
                                                    }
                                                    className="max-w-sm"
                                                />
                                            ) : null}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </Fragment>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Yükleniyor...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => router.push(`/urunler/${row.original.id}`)}
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Kayıt bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-2 py-4 px-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Önceki
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Sonraki
                    </Button>
                </div>
            </div>
        </div>
    );
}
