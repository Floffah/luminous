import { ChevronDownIcon, EarthIcon } from "lucide-react";
import { NavigationMenu } from "radix-ui";

import { getDocTypeIcon } from "@/lib/docTypes.ts";
import { normalisedBaseUrl } from "@/lib/urls.ts";

export interface DocNavGroup {
    type: string;
    docs: {
        title: string;
        href: string;
    }[];
}

interface SiteNavigationProps {
    currentPath: string;
    groups: DocNavGroup[];
}

export default function SiteNavigation({
    currentPath,
    groups,
}: SiteNavigationProps) {
    return (
        <NavigationMenu.Root
            aria-label="Site navigation"
            className="heading-inset relative z-10 w-fit rounded-br-xl bg-background py-2 pr-3"
        >
            <NavigationMenu.List className="flex list-none items-center gap-1">
                <NavigationMenu.Item>
                    <NavigationMenu.Link asChild>
                        <a
                            className="mr-2 flex h-9 items-center gap-2 rounded-md px-1 transition-colors outline-none hover:text-muted focus-visible:ring-2 focus-visible:ring-foreground/70"
                            href={normalisedBaseUrl}
                        >
                            <EarthIcon aria-hidden="true" className="size-6" />
                            <span className="font-bold">Luminous</span>
                        </a>
                    </NavigationMenu.Link>
                </NavigationMenu.Item>

                {groups.map((group) => {
                    const Icon = getDocTypeIcon(group.type);

                    return (
                        <NavigationMenu.Item
                            className="relative"
                            key={group.type}
                        >
                            <NavigationMenu.Trigger
                                className="flex items-center justify-center gap-1 rounded-md border border-card px-2 py-1 transition-colors outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-foreground/70 data-[state=open]:bg-card"
                                title={group.type}
                            >
                                <Icon aria-hidden="true" className="size-4" />
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                <span className="sr-only">
                                    {group.type} documents
                                </span>
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Content className="data-[state=closed]:animate-out data-[state=open]:animate-in absolute top-full left-0 z-50 mt-2 min-w-56 rounded-xl border border-foreground/10 bg-card p-2 text-foreground shadow-xl">
                                <p className="px-2 pt-1 pb-2 text-xs font-semibold tracking-wider text-muted uppercase">
                                    {group.type}
                                </p>
                                <ul className="flex flex-col">
                                    {group.docs.map((doc) => {
                                        const active = currentPath === doc.href;

                                        return (
                                            <li key={doc.href}>
                                                <NavigationMenu.Link
                                                    active={active}
                                                    asChild
                                                >
                                                    <a
                                                        aria-current={
                                                            active
                                                                ? "page"
                                                                : undefined
                                                        }
                                                        className="block rounded-lg px-2 py-1 text-sm transition-colors outline-none hover:bg-background/20 focus-visible:bg-background/20 data-active:bg-background/20"
                                                        href={doc.href}
                                                    >
                                                        {doc.title}
                                                    </a>
                                                </NavigationMenu.Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                    );
                })}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
