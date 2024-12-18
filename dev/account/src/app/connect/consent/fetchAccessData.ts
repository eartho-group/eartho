import apiService from "@/service/api.service";

export const fetchAccessData = async (
    accessToken: string,
    clientId: string,
    accessId: string | null | undefined,
    t: (key: string) => string
) => {
    try {
        // Build the query string, including accessId only if it is provided
        const accessIdParam = accessId ? `&accessId=${accessId}` : '';
        const response = await apiService.get(`/access/preview/full?clientId=${clientId}${accessIdParam}`, {
            accessToken: accessToken
        });

        const data = response;
        const access = data.access;
        const wallet = data.wallet;

        const title = access.metadata.title;
        const trustBadges = [t('accessterms.trust.oneTime')];

        let termsBadges = [t('accessterms.payment.free')];
        const terms = access?.terms;
        const payment = terms?.userProvides?.payment || terms?.payment;

        let hasPayment = false;
        if (payment?.type && payment?.type != 'none') {
            hasPayment = true;
            termsBadges = [formatPaymentText(payment.price, payment.type, payment.currency, payment.duration, t)];
        }

        const identity = terms?.userProvides?.identity || terms?.identity;
        if (identity) {
            const identityText = identity.map((item: string) => t(`accessterms.identity.${item}`.toLowerCase())).join(", ");
            termsBadges.push(identityText);
        }

        return {
            title,
            trustBadges,
            termsBadges,
            wallet: wallet,
            identities: data.identities,
            hasPayment
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

function formatPaymentText(
    price: number,
    type: string,
    currency: string,
    duration: { amount: number, unit: string },
    t: (key: string) => string
) {
    if (price === 0 || price === null || price === undefined) {
        return t('accessterms.payment.free');
    }

    const period = type === 'recurring' ? t('accessterms.payment.every') : t('accessterms.payment.for');
    return `${price} ${currency?.toUpperCase()} ${period} ${duration?.amount} ${t(`accessterms.payment.${duration.unit}`)}`;
}
