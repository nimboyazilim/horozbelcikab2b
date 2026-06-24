'use client';

import { useState, useEffect, Fragment } from 'react';
import { PlusIcon, Settings, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/config/api';
import api from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/dist/client/components/navigation';
import { Separator } from '@/components/ui/separator';

// Table imports
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

// Dialog imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Checkbox imports
import { Checkbox } from "@/components/ui/checkbox"

import BreadcrumbComp from '@/app/components/breadcrumbComp';
import { Input } from "@/components/ui/input"

// Tip tanımlaması
interface User {
    id: number;
    ad: string;
    soyad: string;
    eposta: string;
    durum: number;
    create_date: string;
    tam_ad: string;
}

interface Menu {
    id: number;
    menu_adi: string;
    menu_link: string;
    menu_icon: string;
    menu_ust_id: number;
    alt_menuler?: Menu[];
}

interface UserYetki {
    user_id: number;
    yetkili_menu_ids: number[];
}

export default function KullanicilarListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [data, setData] = useState<User[]>([]);
    const [filteredData, setFilteredData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        tam_ad: '',
        eposta: '',
        durum: ''
    });

    // Yetki yönetimi state'leri
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [menuler, setMenuler] = useState<Menu[]>([]);
    const [userYetkiler, setUserYetkiler] = useState<number[]>([]);
    const [isYetkiDialogOpen, setIsYetkiDialogOpen] = useState(false);
    const [isYetkiLoading, setIsYetkiLoading] = useState(false);

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "id",
            header: "ID",
            enableColumnFilter: false,
        },
        {
            accessorKey: "tam_ad",
            header: "Ad Soyad"
        },
        {
            accessorKey: "eposta",
            header: "E-posta"
        },
        {
            accessorKey: "durum",
            header: "Durum",
            cell: ({ row }) => {
                const durum = row.getValue("durum") as number;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        durum === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {durum === 1 ? 'Aktif' : 'Pasif'}
                    </span>
                );
            }
        },
        {
            accessorKey: "create_date",
            header: "Kayıt Tarihi",
            cell: ({ row }) => {
                const date = new Date(row.getValue("create_date"));
                return date.toLocaleDateString('tr-TR');
            }
        },
        {
            id: "actions",
            header: "İşlemler",
            enableColumnFilter: false,
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <Link href={`/kullanicilar/${row.original.id}`}>
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                <Edit className="h-4 w-4" />
                                Düzenle
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleYetkiClick(row.original);
                            }}
                        >
                            <Shield className="h-4 w-4" />
                            Yetkiler
                        </Button>
                    </div>
                );
            }
        }
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: { pageSize: 10 },
        },
        state: {
            sorting,
        },
    });

    // İlk veri yüklemesi
    useEffect(() => {
        fetchData();
        fetchMenuler();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.userListe);
            
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

    const fetchMenuler = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.menulerListe);
            setMenuler(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Menüler yüklenirken bir hata oluştu."
            });
        }
    };

    const handleYetkiClick = async (user: User) => {
        setSelectedUser(user);
        setIsYetkiDialogOpen(true);
        setIsYetkiLoading(true);
        
        try {
            const response = await api.get(`${API_ENDPOINTS.userYetkiGetir}${user.id}`);
            setUserYetkiler(response.data.yetkili_menu_ids || []);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Kullanıcı yetkileri yüklenirken bir hata oluştu."
            });
            setUserYetkiler([]);
        } finally {
            setIsYetkiLoading(false);
        }
    };

    const handleYetkiSave = async () => {
        if (!selectedUser) return;
        
        setIsYetkiLoading(true);
        try {
            await api.post(API_ENDPOINTS.userYetkiKaydet, {
                user_id: selectedUser.id,
                menu_ids: userYetkiler
            }, {
                _logAction: {
                    action: `Kullanıcı yetkileri güncellendi: "${selectedUser.tam_ad}"`,
                    category: 'Kullanıcı',
                },
            } as object);
            
            toast({
                title: "Başarılı",
                description: "Kullanıcı yetkileri başarıyla kaydedildi."
            });
            
            setIsYetkiDialogOpen(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Yetkiler kaydedilirken bir hata oluştu."
            });
        } finally {
            setIsYetkiLoading(false);
        }
    };

    const handleMenuToggle = (menuId: number) => {
        setUserYetkiler(prev => {
            if (prev.includes(menuId)) {
                return prev.filter(id => id !== menuId);
            } else {
                return [...prev, menuId];
            }
        });
    };

    const handleParentMenuToggle = (menu: Menu) => {
        const allChildIds = getAllChildMenuIds(menu);

        if (allChildIds.length === 0) {
            // Alt menüsü olmayan menü (örn. Dashboard) - direkt toggle
            setUserYetkiler(prev =>
                prev.includes(menu.id)
                    ? prev.filter(id => id !== menu.id)
                    : [...prev, menu.id]
            );
            return;
        }

        const hasAllChildren = allChildIds.every(id => userYetkiler.includes(id));

        if (hasAllChildren) {
            setUserYetkiler(prev => prev.filter(id => !allChildIds.includes(id) && id !== menu.id));
        } else {
            setUserYetkiler(prev => [...new Set([...prev, menu.id, ...allChildIds])]);
        }
    };

    const getAllChildMenuIds = (menu: Menu): number[] => {
        let ids: number[] = [];
        if (menu.alt_menuler) {
            menu.alt_menuler.forEach(altMenu => {
                ids.push(altMenu.id);
                ids = [...ids, ...getAllChildMenuIds(altMenu)];
            });
        }
        return ids;
    };

    const isParentMenuSelected = (menu: Menu): boolean => {
        const allChildIds = getAllChildMenuIds(menu);
        return allChildIds.every(id => userYetkiler.includes(id)) && userYetkiler.includes(menu.id);
    };

    const isParentMenuIndeterminate = (menu: Menu): boolean => {
        const allChildIds = getAllChildMenuIds(menu);
        const selectedChildCount = allChildIds.filter(id => userYetkiler.includes(id)).length;
        return selectedChildCount > 0 && selectedChildCount < allChildIds.length;
    };

    // Filtreleme işlemi
    useEffect(() => {
        const filtered = data.filter((row: User) => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key as keyof typeof filters].toLowerCase();
                if (!filterValue) return true;
                
                const cellValue = String(row[key as keyof User]).toLowerCase();
                return cellValue.includes(filterValue);
            });
        });
        
        setFilteredData(filtered);
        table.setPageIndex(0);
    }, [filters, data]);

    // Filtreleme fonksiyonu
    const handleFilterChange = (columnId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    const breadcrumbData = [
        { name: 'Kullanıcı Listesi', link: '/kullanicilar/liste' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
                <div>
                    <Link href="/kullanicilar">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Kullanıcı
                        </Button>
                    </Link>
                </div>
            </div>

            <Separator className="my-5" />

            {/* Filtreler */}
            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <Input
                        placeholder="Ad Soyad ara..."
                        value={filters.tam_ad}
                        onChange={(e) => handleFilterChange('tam_ad', e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <Input
                        placeholder="E-posta ara..."
                        value={filters.eposta}
                        onChange={(e) => handleFilterChange('eposta', e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <Input
                        placeholder="Durum ara..."
                        value={filters.durum}
                        onChange={(e) => handleFilterChange('durum', e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
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
                                    className="cursor-pointer hover:bg-muted/50"
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
            </div>

            {/* Sayfalama */}
            <div className="flex items-center justify-between py-3">
                <div className="text-sm text-muted-foreground">
                    Toplam {filteredData.length} kullanıcı
                    {table.getPageCount() > 1 && ` — Sayfa ${table.getState().pagination.pageIndex + 1} / ${table.getPageCount()}`}
                </div>
                <div className="flex gap-2">
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

            {/* Yetki Yönetimi Dialog */}
            <Dialog open={isYetkiDialogOpen} onOpenChange={setIsYetkiDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.tam_ad} - Yetki Yönetimi
                        </DialogTitle>
                        <DialogDescription>
                            Kullanıcının erişebileceği menüleri seçiniz.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isYetkiLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p>Yetkiler yükleniyor...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {menuler.map((menu) => (
                                <div key={menu.id} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`menu-${menu.id}`}
                                            checked={isParentMenuSelected(menu)}
                                            onCheckedChange={() => handleParentMenuToggle(menu)}
                                        />
                                        <label
                                            htmlFor={`menu-${menu.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {menu.menu_adi}
                                        </label>
                                    </div>
                                    
                                    {menu.alt_menuler && menu.alt_menuler.length > 0 && (
                                        <div className="ml-6 space-y-1">
                                            {menu.alt_menuler.map((altMenu) => (
                                                <div key={altMenu.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`menu-${altMenu.id}`}
                                                        checked={userYetkiler.includes(altMenu.id)}
                                                        onCheckedChange={() => handleMenuToggle(altMenu.id)}
                                                    />
                                                    <label
                                                        htmlFor={`menu-${altMenu.id}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {altMenu.menu_adi}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsYetkiDialogOpen(false)}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleYetkiSave}
                            disabled={isYetkiLoading}
                        >
                            {isYetkiLoading ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}