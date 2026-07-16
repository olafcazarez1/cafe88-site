export function mapDeliveryAddress(address: DeliveryAddress) {
    return {
        name: address.name,
        email: address.email,
        phone: address.phone,

        street: address.street,

        exterior_number: address.exteriorNumber,
        interior_number: address.interiorNumber,

        neighborhood: address.neighborhood,
        postal_code: address.postalCode,

        city: address.city,
        state: address.state,

        reference: address.reference
    }
}