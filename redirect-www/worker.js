// Sends www.physiog.co.il to the apex. A custom domain cannot redirect on its
// own, and a Redirect Rule needs a dashboard click that no commit records.
const APEX = 'https://physiog.co.il';

export default {
  fetch(request) {
    const { pathname, search } = new URL(request.url);
    // 301 for reads, as crawlers expect. 308 for anything else, so a POST that
    // lands on www is replayed as a POST instead of turning into a GET.
    const status = request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;
    return Response.redirect(APEX + pathname + search, status);
  },
};
