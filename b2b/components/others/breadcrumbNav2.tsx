import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { useTranslations } from "next-intl";


export default function BreadcrumbNav2({data}: {data: {title: string, href: string}[]}) {
    const t = useTranslations('Header');
    return(
     
        <div className="max-w-screen-2xl h-auto mx-auto pt-5 px-4">
          <h1 className="text-3xl font-bold">{data[1].title}</h1>
          <Breadcrumb>
              <BreadcrumbList>
                  <BreadcrumbItem>
                      <BreadcrumbLink asChild className="hover:text-gray-400">
                          <Link href="/">{t('home')}</Link>
                      </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                      <Link href={data[0].href}>{data[0].title}</Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                      <Link href={data[1].href}>{data[1].title}</Link>
                  </BreadcrumbItem>
              </BreadcrumbList>
          </Breadcrumb>
        </div>

    )  
}