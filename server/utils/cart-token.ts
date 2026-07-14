import type { H3Event } from 'h3'

const CART_COOKIE_NAME = 'cafe88_cart_token'

export function getOrCreateCartToken(event: H3Event): string {
    let cartToken = getCookie(event, CART_COOKIE_NAME)

    if (!cartToken) {
        cartToken = crypto.randomUUID()

        setCookie(event, CART_COOKIE_NAME, cartToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 365
        })
    }

    return cartToken
}