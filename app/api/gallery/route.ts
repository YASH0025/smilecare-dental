import { galleryService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { collection } = crudRoutes(galleryService, (g) => g.published);
export const { GET, POST } = collection;
