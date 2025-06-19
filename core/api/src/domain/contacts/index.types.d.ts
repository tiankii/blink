type ContactType =
  (typeof import("./primitives").ContactType)[keyof typeof import("./primitives").ContactType]

type Contact = {
  readonly id: ContactId
  readonly createdAt: Date
  accountId: AccountId
  type: ContactType
  handle: string
  displayName: string
  transactionsCount: number
  updatedAt?: Date
}

type NewContactInput = Omit<Contact, "id" | "createdAt" | "updatedAt">

interface IContactsRepository {
  findContact({
    accountId,
    handle,
  }: {
    accountId: AccountId
    handle?: string
  }): Promise<Contact | RepositoryError>

  getContactsByAccountId(accountId: string): Promise<Contact[] | RepositoryError>

  persistNew(contact: NewContactInput): Promise<Contact | RepositoryError>

  update(contact: Contact): Promise<Contact | RepositoryError>
}
