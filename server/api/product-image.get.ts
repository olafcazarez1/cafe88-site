export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const imagePath = String(query.path ?? '').replace(/^\/+/, '')

    if (
        !imagePath ||
        !imagePath.startsWith('resources/assets/') ||
        imagePath.includes('..')
    ) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid product image path.'
        })
    }

    try {
        const imageUrl = new URL(
            imagePath,
            `${String(config.erpBaseUrl).replace(/\/$/, '')}/`
        )

        const response = await fetch(imageUrl, {
            headers: {
                Authorization: `Bearer ${config.erpApiToken}`
            }
        })

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: 'Product image not found.'
            })
        }

        const contentType =
            response.headers.get('content-type') || 'image/jpeg'

        const image = await response.arrayBuffer()

        setResponseHeader(event, 'Content-Type', contentType)
        setResponseHeader(
            event,
            'Cache-Control',
            'public, max-age=3600, stale-while-revalidate=86400'
        )

        return new Uint8Array(image)
    } catch (error: unknown) {
        const fetchError = error as {
            statusCode?: number
            message?: string
        }

        console.error(
            'Unable to load ERP product image:',
            imagePath,
            fetchError.message
        )

        throw createError({
            statusCode: fetchError.statusCode || 502,
            statusMessage: 'No fue posible cargar la imagen.'
        })
    }
})