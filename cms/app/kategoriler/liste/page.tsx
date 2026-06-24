'use client';

import { useState, useEffect, Fragment } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/config/api';
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
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import { Input } from "@/components/ui/input"
import KategoriMikroSenkron from '@/app/components/kategori/kategoriSenkron';
// Tip tanımlaması için interface ekleyelim
interface Kategori {
    id: number;
    [key: string]: any; // Diğer alanlar için genel tip
}

export default function KategoriListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState({
        id: "",
        kategori_adi: "",
        kategori_seo: "",
        ust_kategori_adi: ""
    });

    const columns: ColumnDef<Kategori>[] = [
        {
            accessorKey: "id",
            header: "ID"
        },
        {
            accessorKey: "kategori_adi",
            header: "Kategori Adı"
        },
        {
            accessorKey: "kategori_seo",
            header: "Kategori Seo"
        },
        {
            accessorKey: "ust_kategori_adi",
            header: "Ana Kategori"
        }

    ];

    const table = useReactTable({
        data: filteredData,
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

    useEffect(() => {
        const filtered = data.filter((row: Kategori) => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key as keyof typeof filters].toLowerCase();
                if (!filterValue) return true;
                
                const cellValue = String(row[key as keyof Kategori]).toLowerCase();
                return cellValue.includes(filterValue);
            });
        });
        
        setFilteredData(filtered);
        table.setPageIndex(0);
    }, [filters, data]);

    const handleFilterChange = (columnId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.kategoriListe);
            setData(response.data);
            setFilteredData(response.data);
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
        { name: 'Kategori Listesi', link: '/kategoriler/liste' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
                <div className='flex flex-row gap-2'>
                    <KategoriMikroSenkron />
                    <Link href="/kategoriler">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Kategori
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
                                        <TableHead key={`filter-${header.id}`}>
                                            {header.column.id && (
                                                <Input
                                                    placeholder={`Filtrele...`}
                                                    value={filters[header.column.id as keyof typeof filters] || ''}
                                                    onChange={(e) => handleFilterChange(header.column.id, e.target.value)}
                                                    className="h-8 w-full"
                                                />
                                            )}
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
                                    onClick={() => router.push(`/kategoriler/${row.original.id}`)}
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
