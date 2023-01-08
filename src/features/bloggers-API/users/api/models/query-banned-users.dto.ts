export class QueryBannedUsersDto {
  searchLoginTerm: string;
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
}
