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

export default function SiparislerListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        create_date: "",
        siparis_no: "",
        musteri_adi: "",
        toplam_fiyat: "",
        odeme: "",
        durum: "",
        erp_durum: ""
    });

    const columns: ColumnDef<Kategori>[] = [
      /*  {
            accessorKey: "id",
            header: "ID"
        }, */
        {
            accessorKey: "create_date",
            header: "Oluşturma Tarihi",
            cell: ({ row }) => {
                const date = new Date(row.getValue("create_date"));
                return date.toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            accessorKey: "siparis_no",
            header: "Sipariş No"
        },
        {
            accessorKey: "erp_seri",
            header: "Erp Seri"
        },
        {
            accessorKey: "erp_sira",
            header: "Erp Sıra"
        },
        {
            accessorKey: "musteri_adi",
            header: "Müşteri Adı"
        },
        {
            accessorKey: "toplam_fiyat",
            header: "Tutar",
            cell: ({ row }) => {
                const fiyat = Number(row.getValue("toplam_fiyat")).toFixed(2).replace('.', ',');
                return `${fiyat}`;
            }
        },
      /*  {
            accessorKey: "odeme",
            header: "Ödeme Türü",
            cell: ({ row }) => {
                const odeme = row.getValue("odeme");
                return odeme == 0 ? 
                <div className="p-1 rounded-md bg-orange-500 text-white text-xs text-center w-20">Havale</div> : 
                <div className="p-1 rounded-md bg-blue-500 text-white text-xs text-center w-20">Kredi Kartı</div>;
            }
        }, */
        {
            accessorKey: "durum",
            header: "Durum",
            cell: ({ row }) => {
                const durum = row.getValue("durum");
                switch (durum) {
                    case 0:
                        return <div className="p-1 rounded-md bg-yellow-500 text-white text-xs text-center w-24">Beklemede</div>;
                    case 1:
                        return <div className="p-1 rounded-md bg-blue-500 text-white text-xs text-center w-24">Onaylandı</div>;
                    case 2:
                        return <div className="p-1 rounded-md bg-purple-500 text-white text-xs text-center w-24">Hazırlanıyor</div>;
                    case 3:
                        return <div className="p-1 rounded-md bg-orange-500 text-white text-xs text-center w-24">Kargoda</div>;
                    case 4:
                        return <div className="p-1 rounded-md bg-green-500 text-white text-xs text-center w-24">Teslim Edildi</div>;
                    case 5:
                        return <div className="p-1 rounded-md bg-red-500 text-white text-xs text-center w-24">İptal Edildi</div>;
                    case 6:
                        return <div className="p-1 rounded-md bg-yellow-500 text-white text-xs text-center w-24">Hazır</div>;
                    default:
                        return <div className="p-1 rounded-md bg-gray-500 text-white text-xs text-center w-24">Bilinmiyor</div>;
                }
            }
        },
        {
            accessorKey: "erp_durum",
            header: "Erp Durum",
            cell: ({ row }) => {
                const erp_durum = row.getValue("erp_durum");
                return erp_durum == 0 ? 
                    <div className="p-1 rounded-md bg-red-500 text-white text-xs text-center w-20">Aktarılmadı</div> : 
                    <div className="p-1 rounded-md bg-green-500 text-white text-xs text-center w-20">Aktarıldı</div>;
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
                const response = await api.get(API_ENDPOINTS.siparislerListe);
                const allData = response.data;
                
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
            const response = await api.get(API_ENDPOINTS.siparislerListe);
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
        { name: 'Sipariş Listesi', link: '/siparisler/liste' },
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
                <div>
                    <Link href="/siparisler/yeni-siparis">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Sipariş
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
                                    onClick={() => router.push(`/siparisler/${row.original.id}`)}
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
