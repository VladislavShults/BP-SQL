export class QueryBlogDto {
  searchNameTerm: string;
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
}
