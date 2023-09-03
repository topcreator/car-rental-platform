export const enum UserType {
    Admin = 'admin',
    Company = 'company',
    User = 'user',
}

export const enum AppType {
    Backend = 'backend',
    Frontend = 'frontend',
}

export const enum CarType {
    Diesel = 'diesel',
    Gasoline = 'gasoline'
}

export const enum GearboxType {
    Manual = 'manual',
    Automatic = 'automatic'
}

export const enum FuelPolicy {
    LikeForlike = 'likeForlike',
    FreeTank = 'freeTank'
}

export const enum BookingStatus {
    Void = 'void',
    Pending = 'pending',
    Deposit = 'deposit',
    Paid = 'paid',
    Reserved = 'reserved',
    Cancelled = 'cancelled'
}

export const enum Mileage {
    Limited = 'limited',
    Unlimited = 'unlimited'
}

export const enum Availablity {
    Available = 'available',
    Unavailable = 'unavailable'
}

export const enum RecordType {
    Admin = 'admin',
    Company = 'company',
    User = 'user',
    Car = 'car',
    Location = 'location'
}

export interface Driver {
    email: string
    phone: string
    fullName: string
    birthDate: string
    language: string
    verified: boolean
    blacklisted: boolean
}

export interface Booking {
    _id?: string
    company: string | User
    car: string | Car
    driver: string
    pickupLocation: string
    dropOffLocation: string
    from: Date
    to: Date
    status: string
    cancellation?: boolean
    amendments?: boolean
    theftProtection?: boolean
    collisionDamageWaiver?: boolean
    fullInsurance?: boolean
    additionalDriver?: boolean
    _additionalDriver?: string | AdditionalDriver
    cancelRequest?: boolean
    price?: number
}

export interface BookPayload {
    driver: Driver
    booking: Booking
}

export interface Filter {
    from: Date
    to: Date
    keyword?: string
    pickupLocation?: string
    dropOffLocation?: string
}

export interface GetBookingsPayload {
    companies: string[]
    statuses: string[]
    user?: string
    car?: string
    filter?: Filter
}


export interface AdditionalDriver {
    fullName: string
    email: string
    phone: string
    birthDate: Date
}

export interface UpsertBookingPayload {
    booking: Booking
    additionalDriver?: AdditionalDriver
}

export interface LocationName {
    language: string
    name: string
}

export interface UpdateSupplierPayload {
    _id: string
    fullName: string
    phone: string
    location: string
    bio: string
    payLater: boolean
}

export interface CreateCarPayload {
    name: string
    company: string
    minimumAge: number
    locations: string[]
    price: number
    deposit: number
    available: boolean
    type: string
    gearbox: string
    aircon: boolean
    image: string
    seats: number
    doors: number
    fuelPolicy: string
    mileage: number
    cancellation: number
    amendments: number
    theftProtection: number
    collisionDamageWaiver: number
    fullInsurance: number
    additionalDriver: number
}

export interface UpdateCarPayload extends CreateCarPayload {
    _id: string
}

export interface GetCarsPayload {
    companies: string[]
    fuel: string[]
    gearbox: string[]
    mileage: string[]
    deposit: number
    availability: string[]
    pickupLocation?: string
}

export interface BackendSignUpPayload {
    email: string
    password: string
    fullName: string
    language: string
    active?: boolean
    verified?: boolean
    blacklisted?: boolean
    type?: string
    avatar?: string
}

export interface FrontendSignUpPayload extends BackendSignUpPayload {
    birthDate: number | Date
}

export interface CreateUserPayload {
    email: string
    phone: string
    location: string
    bio: string
    fullName: string
    type: string
    avatar: string
    birthDate: number | Date
    language: string
    agency: string
    password?: string
    verified?: boolean
    blacklisted?: boolean
}

export interface UpdateUserPayload extends CreateUserPayload {
    _id: string
    enableEmailNotifications: boolean
    payLater: boolean
}

export interface changePasswordPayload {
    _id: string
    password: string
    newPassword: string
    strict: boolean
}

export interface ActivatePayload {
    userId: string
    token: string
    password: string
}

export interface ValidateEmailPayload {
    email: string
}

export interface SignInPayload {
    email: string
    password?: string
    stayConnected?: boolean
}

export interface ResendLinkPayload {
    email?: string
}

export interface UpdateEmailNotifications {
    _id: string
    enableEmailNotifications: boolean
}

export interface UpdateLanguage {
    id: string
    language: string
}

export interface ValidateSupplierPayload {
    fullName: string
}

export interface ValidateLocationPayload {
    language: string
    name: string
}

export interface UpdateStatusPayload {
    ids: string[]
    status: string
}

export interface User {
    _id: string
    company?: User
    fullName: string
    email?: string
    phone?: string
    password?: string
    birthDate?: Date
    verified?: boolean
    verifiedAt?: Date
    active?: boolean
    language?: string
    enableEmailNotifications?: boolean
    avatar?: string
    bio?: string
    location?: string
    type?: string
    blacklisted?: boolean
    payLater?: boolean
}

export interface LocationValue {
    language: string
    value: string
}

export interface Location {
    _id: string
    name?: string
    values: LocationValue[]
}

export interface Car {
    _id: string
    name: string
    company: User
    minimumAge: number
    locations: Location[]
    price: number
    deposit: number
    available: boolean
    type: CarType
    gearbox: GearboxType
    aircon: boolean
    image?: string
    seats: number
    doors: number
    fuelPolicy: FuelPolicy
    mileage: number
    cancellation: number
    amendments: number
    theftProtection: number
    collisionDamageWaiver: number
    fullInsurance: number
    additionalDriver: number
    [propKey: string]: any
}

export interface Data<T> {
    rows: T[]
    rowCount: number
}

export interface GetBookingCarsPayload {
    company: string
    pickupLocation: string
}
