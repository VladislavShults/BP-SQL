export class QueryGetPostsByBlogIdDto {
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
}
