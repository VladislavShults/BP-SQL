export class QueryPostDto {
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
}
