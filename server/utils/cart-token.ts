import type { H3Event } from 'h3'

const CART_COOKIE_NAME = 'cafe88_cart_token'

function setCartTokenCookie(
    event: H3Event,
    cartToken: string
): void {
    setCookie(event, CART_COOKIE_NAME, cartToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365
    })
}

export function createCartToken(event: H3Event): string {
    const cartToken = crypto.randomUUID()

    setCartTokenCookie(event, cartToken)
    event.context.cartToken = cartToken

    return cartToken
}

export function getOrCreateCartToken(event: H3Event): string {
    if (event.context.cartToken) {
        return event.context.cartToken
    }

    const cartToken = getCookie(event, CART_COOKIE_NAME)

    if (cartToken) {
        event.context.cartToken = cartToken
        return cartToken
    }

    return createCartToken(event)
}

export function renewCartToken(event: H3Event): string {
    return createCartToken(event)
}