const { stringify } = require("query-string");

class API {
    url;

    constructor(url){
        this.url = url;
    }

    // Public methods
    submitPost(name, content){
        return this.request('POST', '/posts', { name, content });
    }

    getPosts() {
        return this.request('GET', '/posts');
    }

    getPost(id){
        return this.request('GET', `/posts/${id}`);
    }

    async request(method, path, args){
        let body = null;
        let query = '';
        const headers = new Headers();
        headers.append('Accept', 'application/json');

        if(method === 'POST' || method === 'PUT'){
            body = JSON.stringify(args);
            headers.append('Content-Type', 'application/json');
        }
        else if (args !== undefined) {
            query = `?${stringify(args)}`;
        }
        try {
            const res = await fetch(this.url + path + query, {
                method,
                headers,
                body
            });
            if (!res.ok) {
                let errMsg;
                try {
                    const errBody = await res.json();
                    if (!errBody.error)
                        throw new Error();
                    errMsg = errBody.error;
                } catch (error) {
                    throw new Error(`${res.status}: ${res.statusText}`);
                }
                throw new Error(errMsg);
            }
            const res_1 = await res.json();
            return res_1.data;
        } catch (err) {
            console.log(`App error calling ${method} ${path}`, err);
            throw err;
        }
    }
}

export default new API(process.env.API_PATH);