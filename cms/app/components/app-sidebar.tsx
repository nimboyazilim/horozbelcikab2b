import { Calendar, LayoutDashboard, Inbox, Search, Settings, ChevronDown, ChevronUp, Dot, CloudCog, PackageSearch, User, Users, ClipboardList } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import Link from "next/link";
import { ShoppingCart, SlidersHorizontal, BookOpen } from "lucide-react";

// İkon nesnesini güncelle
const Icons = {
  "LayoutDashboard": LayoutDashboard,
  "Inbox": Inbox,
  "Calendar": Calendar,
  "Search": Search,
  "Settings": Settings,
  "ShoppingCart": ShoppingCart,
  "PackageSearch": PackageSearch,
  "Dot": Dot,
  "CloudCog": CloudCog,
  "SlidersHorizontal": SlidersHorizontal,
  "BookOpen": BookOpen,
  "User": User,
  "Users": Users,
  "ClipboardList": ClipboardList
};

export function AppSidebar() {

  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

    if (accessToken) {
        const decodedToken = decodeJWT(accessToken);
        if (decodedToken && decodedToken.id) {
          setUserId(decodedToken.id);
        }
    }
}, []);

 // JWT'den payload'ı decode eden yardımcı fonksiyon
 function decodeJWT(token: string) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('JWT parts:', parts.length, 'Token preview:', token.substring(0, 50) + '...');
      return null;
    }
    
    // Debug için token'ın ilk kısmını logla
    console.log('JWT header:', parts[0]);
    console.log('JWT payload part:', parts[1]);
    
    // Base64url'yi standart base64'e çevir
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Padding ekle
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    console.log('Converted base64:', base64);
    console.log('Padded base64:', padded);
    
    // Try-catch ile atob işlemini güvenli hale getir
    let decodedPayload;
    try {
      decodedPayload = atob(padded);
    } catch (atobError) {
      console.error('atob error:', atobError);
      // Alternatif decode yöntemi dene - base64url'yi doğrudan decode et
      try {
        // Base64url'yi decode et
        const binaryString = window.atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        decodedPayload = decodeURIComponent(escape(binaryString));
      } catch (alternativeError) {
        console.error('Alternative decode error:', alternativeError);
        return null;
      }
    }
    
    const payload = JSON.parse(decodedPayload);
    
    // Türkçe karakterler için decode işlemi
    if (payload.adsoyad) {
      payload.adsoyad = decodeURIComponent(escape(payload.adsoyad));
    }
    if (payload.eposta) {
      payload.eposta = decodeURIComponent(escape(payload.eposta));
    }
    
    return payload;
  } catch (e) {
    console.error('JWT decode error:', e);
    console.error('Token that failed:', token);
    return null;
  }
}

  useEffect(() => {
    const fetchData = async () => {
        // userId null ise API çağrısı yapma
        if (!userId) return;
        
        setLoading(true);
        try {
            const response = await api.get(API_ENDPOINTS.menulerListe2 + userId);
            if (response.status === 200) {
              setMenuItems(response.data || []);
            }
        } catch (error) {
            console.error('Menü yükleme hatası:', error);
            toast({
                title: "Hata!",
                description: "Menüler getirilirken bir hata oluştu.",
                variant: "destructive",
            });
            setMenuItems([]);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [userId, toast]);

  const toggleSubmenu = (menuId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Menüler yükleniyor...
                </div>
              ) : menuItems.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Menü bulunamadı
                </div>
              ) : (
                menuItems.map((item: any) => {
                  const IconComponent = Icons[item.menu_icon as keyof typeof Icons] || LayoutDashboard;
                  const hasSubMenu = item.alt_menuler && item.alt_menuler.length > 0;

                  return (
                    <div key={item.id}>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild
                          onClick={(e) => {
                            if (hasSubMenu) {
                              e.preventDefault();
                              toggleSubmenu(item.menu_adi);
                            }
                          }}
                        >
                          <Link href={hasSubMenu ? '#' : '/' + item.menu_link}>
                            <IconComponent />
                            <span>{item.menu_adi}</span>
                            {hasSubMenu && (
                              <span style={{ marginLeft: 'auto' }}>
                                {openMenus[item.menu_adi] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      
                      {/* Alt menüler için kontrol ve render */}
                      {hasSubMenu && openMenus[item.menu_adi] && (
                        <div style={{ marginLeft: '0px' }}>
                          {item.alt_menuler.map((subItem: any) => {
                            const SubIconComponent = Icons[subItem.menu_icon as keyof typeof Icons] || Dot;
                            return (
                              <SidebarMenuItem key={subItem.id}>
                                <SidebarMenuButton asChild>
                                  <Link href={'/' + subItem.menu_link}>
                                    <SubIconComponent />
                                    <span>{subItem.menu_adi}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
