async function paginate({ query, countQuery, page = 1, limit = 10, sort = { createdAt: -1 } }) {
    try {
        const currentPage = Math.max(1, parseInt(page) || 1);
        const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit) || 10)); 
        const skip = (currentPage - 1) * itemsPerPage;

        // Get total count and paginated data in parallel
        const [totalItems, items] = await Promise.all([
            countQuery,
            query
                .sort(sort)
                .skip(skip)
                .limit(itemsPerPage)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        return {
            items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            }
        };
    } catch (error) {
        console.error('Error in pagination utility:', error);
        throw error;
    }
}

module.exports = { paginate };

