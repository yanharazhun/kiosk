import { getMenu } from "@/lib/menu/get-menu";

export async function GET() {
  return Response.json(await getMenu());
}
