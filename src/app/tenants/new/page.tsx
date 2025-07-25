// src/app/tenants/new/page.tsx
import TenantDetailPage from "../[id]/page";

// A página de novo tenant é a mesma que a de detalhes
// mas sem ID, então ela detecta automaticamente que é modo criação
export default function NewTenantPage() {
  return <TenantDetailPage />;
}
