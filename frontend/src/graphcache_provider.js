export const GRAPHCACHE_PROVIDERS = [
  // { name: "local", url: 'http://localhost:5080/gcgo/' },
  // { name: "bus's indexer", url: 'https://ambindexer.bus.bz/gcgo/' },
  { name: 'Official', url: 'https://ambindexer.net/gcgo/' }
]


export class GraphcacheProvider {
  constructor() {
    this.selected_provider_index = 0
  }

  async user_balance_tokens(address, chainId) {
    const req = `user_balance_tokens?user=${address}&chainId=${chainId}`
    return (await this.sendRequest(req));
  }

  async user_positions(address, chainId) {
    const req = `user_positions?user=${address}&chainId=${chainId}&omitEmpty=true`
    return (await this.sendRequest(req));
  }

  async sendRequest(req, full = false) {
    let err = null
    for (const i in GRAPHCACHE_PROVIDERS) {
      const provider = GRAPHCACHE_PROVIDERS[this.selected_provider_index]
      const url = new URL(provider.url + req);

      const abort = new AbortController()
      const timeout = setTimeout(() => abort.abort(), 5000)
      try {
        const req = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            // "Content-Type": "application/json",
          },
          signal: abort.signal,
        }).catch();

        const resp = await req.json();
        // console.log("sendRequest resp", resp);

        if (resp.error) {
          throw resp.error;
        }
        if (full) {
          return resp;
        } else {
          return resp.data;
        }
      } catch (e) {
        err = e
        console.error('graphcache fetch error', e)
        this.selected_provider_index = (this.selected_provider_index + 1) % GRAPHCACHE_PROVIDERS.length
      }
    }
    console.error('ran out of providers, throwing')
    throw err
  }
}
