'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { API_ENDPOINTS, API_BASE_URL_KATALOG_RESIM } from '@/config/api';
import api from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/dist/client/components/navigation';
import { Separator } from '@/components/ui/separator';

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
} from "@tanstack/react-table"
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import Image from 'next/image';
// Tip tanımlaması için interface ekleyelim
interface Kategori {
    id: number;
    [key: string]: any; // Diğer alanlar için genel tip
}

export default function KataloglarListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const columns: ColumnDef<Kategori>[] = [
        {
            accessorKey: "id",
            header: "ID"
        },
        {
            accessorKey: "images",
            header: "Resim",
            cell: ({ row }) => (
                <div className="w-10 h-10"> 
                    <Image src={`${API_BASE_URL_KATALOG_RESIM}/${row.original.images}`} alt={row.original.title} width={50} height={50} />
                </div>
            )
        },
        {
            accessorKey: "title",
            header: "Başlık"
        },

    

    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.katalogListe);
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
        { name: 'Kataloglar Listesi', link: '/kataloglar/liste' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
                <div>
                    <Link href="/kataloglar">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Katalog
                        </Button>
                    </Link>
                </div>
            </div>

            <Separator className="my-5" />

            <div className="rounded-md border" style={{ height: 'calc(100vh - 185px)' }}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
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
                                    onClick={() => router.push(`/kataloglar/${row.original.id}`)}
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
