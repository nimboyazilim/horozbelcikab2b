import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import Link from "next/link";
import React from "react";
  
export default function BreadcrumbComp({ data }: { data: { name: string; link: string }[] }) {
    return <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/">Home</Link>
        </BreadcrumbItem>
        {data.map((item, index) => (
          <React.Fragment key={`item-${index}`}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === data.length - 1 ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <Link href={item.link}>{item.name}</Link>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
}
