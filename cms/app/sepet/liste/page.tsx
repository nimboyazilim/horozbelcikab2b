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
} from "@tanstack/react-table"
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import { Input } from "@/components/ui/input"

// Tip tanımlaması için interface ekleyelim
interface Kategori {
    id: number;
    [key: string]: any; // Diğer alanlar için genel tip
}

export default function SepetListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        musteri_id: "",
        ad: "",
        soyad: "",
        eposta: "",
        vkntckn: "",
        kodu: "",
        sepet_miktar: "",

    });

    const columns: ColumnDef<Kategori>[] = [
      /*  {
            accessorKey: "id",
            header: "ID"
        }, */
        {
            accessorKey: "kodu",
            header: "Kodu"
        },
        {
            accessorKey: "ad",
            header: "Adı"
        },
        {
            accessorKey: "soyad",
            header: "Soyadı"
        },
        {
            accessorKey: "eposta",
            header: "E-posta"
        },
        {
            accessorKey: "vkntckn",
            header: "VKN/TCKN"
        },
        {
            accessorKey: "sepet_miktar",
            header: "Miktar",
            cell: ({ row }) => {
                const fiyat = Number(row.getValue("sepet_miktar")).toFixed(2).replace('.', ',');
                return `${fiyat}`;
            }
        },
        {
            accessorKey: "genel_toplam",
            header: "Toplam",
            cell: ({ row }) => {
                const fiyat = Number(row.getValue("genel_toplam")).toFixed(2).replace('.', ',');
                return `${fiyat}`;
            }
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
        const filteredData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.sepetListe);
                const allData = response.data.sepet;
                
                const filtered = allData.filter((row: Kategori) => {
                    return Object.keys(filters).every(key => {
                        const filterValue = filters[key as keyof typeof filters].toLowerCase();
                        if (!filterValue) return true;
                        
                        const cellValue = String(row[key as keyof Kategori]).toLowerCase();
                        return cellValue.includes(filterValue);
                    });
                });
                
                setData(filtered);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Veriler filtrelenirken bir hata oluştu."
                });
            }
        };

        filteredData();
    }, [filters]);

    // İlk veri yüklemesi için ayrı bir useEffect
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.sepetListe);
            if (response.data.status === 'success') {
                setData(response.data.sepet);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: response.data.message
                });
            }
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
        { name: 'Sepet Listesi', link: '/sepet/liste' },
    ];

    // Filtreleme fonksiyonu
    const handleFilterChange = (columnId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
               {/* <div>
                    <Link href="/sepet/yeni-sepet">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Sepet
                        </Button>
                    </Link>
                </div> */}
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
                                    onClick={() => router.push(`/sepet/${row.original.musteri_id}`)}
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
