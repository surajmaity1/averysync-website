import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Orgs = lazy(() => import('@/modules/orgs').then((m) => ({default: m.OrgsPage})));

function OrgsPage() {
    return <Orgs/>
}

export const Route = createFileRoute('/_internal/orgs')({
    component: OrgsPage
})