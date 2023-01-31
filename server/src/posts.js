
class Posts {
    posts = []

    // Add a new post to the list
    addPost(name, content) {
        const post = {
            name,
            content,
            id: Math.floor(Math.random() * 100000000) + 1000,
            time: Date.now(),
            hasPaid: false
        };
        this.posts.push(post);
        return post; 
    }  

    // Get a particar post given an Id
    getPost(id) {
        return this.posts.find(c => c.id === id);
    }

    // Mark a post as paid
    markPostAsPaid(id) {
        let updatedPost;
        this.posts = this.posts.map(c => {
            if(c.id === id){
                updatedPost = { ...c, hasPaid: true };
                return updatedPost;
            }
            return c;
        });
        
        return updatedPost;
    }

    // Return posts that have been paid for in time order
    getPaidPosts() {
        return this.posts
        .filter(p => !!p.hasPaid)
        .sort((a, b) => b.time - a.time);
    }
}

module.exports = Posts