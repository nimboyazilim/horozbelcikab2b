'use client';

import { useState, useEffect, Fragment } from 'react';
import { PlusIcon, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Tip tanımlaması için interface ekleyelim
interface Kategori {
    id: number;
    [key: string]: any; // Diğer alanlar için genel tip
}

export default function MusteriListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Kategori | null>(null);
    const [filters, setFilters] = useState({
        id: "",
        kodu: "",
        ad: "",
        vkntckn: "",
        eposta: "",
        create_date: "",
        durum: ""
    });

    const columns: ColumnDef<Kategori>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "kodu",
            header: "Kodu",
        },
        {
            accessorKey: "ad",
            header: "Ad Soyad",
        },
        {
            accessorKey: "vkntckn",
            header: "VKN/TCKN",
        },
        {
            accessorKey: "eposta",
            header: "E-Posta",
        },
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
                }).replace(',', '');
            }
        },
        {
            accessorKey: "durum",
            header: "Durum",
            cell: ({ row }) => {
                const durum = row.getValue("durum");
                return getDurumComponent(durum as number);
            }
        },
        {
            id: "actions",
            header: "İşlemler",
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(row.original);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
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

    // İlk veri yüklemesi
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.musterilerListe);
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

    // Filtreleme işlemi
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
        table.setPageIndex(0); // Filtreleme yapıldığında ilk sayfaya dön
    }, [filters, data]);

    // Filtreleme fonksiyonu
    const handleFilterChange = (columnId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    // Silme işlemi için fonksiyonlar
    const handleDeleteClick = (customer: Kategori) => {
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;

        try {
            setIsLoading(true);
            const musteriAdi = [customerToDelete.ad, customerToDelete.soyad].filter(Boolean).join(' ');
            const response = await api.delete(
                `${API_ENDPOINTS.musterilerDelete}/${customerToDelete.id}`,
                {
                    _logAction: {
                        action: `Müşteri silindi${musteriAdi ? `: "${musteriAdi}"` : ''}`,
                        category: 'Müşteri',
                    },
                } as object
            );

            if(response.data.status === 'error') {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: response.data.message,
                });
            }

            if(response.data.status === 'success') {
                toast({
                    title: "Başarılı",
                    description: "Müşteri başarıyla silindi.",
                });
            }

            // Veriyi yeniden yükle
            await fetchData();
            
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Müşteri silinirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const breadcrumbData = [
        { name: 'Müşteri Listesi', link: '/musteriler/liste' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
                <div>
                    <Link href="/musteriler">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Müşteri
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
                                            {header.column.id && header.column.id !== "actions" && (
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
                                    onClick={() => router.push(`/musteriler/${row.original.id}`)}
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

            {/* Silme Onay Dialog'u */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{customerToDelete?.ad}</strong> adlı müşteriyi silmek istediğinizden emin misiniz? 
                            Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Durum komponenti için yardımcı fonksiyon
const getDurumComponent = (durum: number) => {
    switch (durum) {
        case 0:
            return <div className="p-1 rounded-md bg-yellow-500 text-white text-xs text-center w-20">Beklemede</div>;
        case 1:
            return <div className="p-1 rounded-md bg-green-500 text-white text-xs text-center w-20">Onaylandı</div>;
        case 2:
            return <div className="p-1 rounded-md bg-red-500 text-white text-xs text-center w-20">Onaylanmadı</div>;   
        default:
            return <div className="p-1 rounded-md bg-gray-500 text-white text-xs text-center w-20">Bilinmiyor</div>;
    }
};
