import { useState, useEffect } from 'react'
import {
    Card,
    CardBody,
    CardHeader,
    Form,
    FormGroup,
    Input,
    Button,
    Alert,
    Spinner
} from 'reactstrap';
import api from '../lib/api';

const PostForm = ({posts}) => {

    const [postFormState, setPostFormState] = useState({
        name: '',
        content: '',
        isPosting: false,
        pendingPost: null, // { id: 0, name: '', content: '', time: 0, hasPaid: false },
        paymentRequest: null,
        error: null
    })

    const {name, content, isPosting, error, paymentRequest, pendingPost } = this.state;
    const disabled = !content.length || !name.length || isPosting;

    useEffect(() => {
        if(pendingPost){
            const hasPosted = !!posts.find((post) => post.id === pendingPost.id);
            if (hasPosted) {
                setPostFormState({ ...postFormState });
            }
        }
    }, [pendingPost]);

    const handleChange = (event) => {
        event.preventDefault();

        setPostFormState({ ...postFormState, [event.target.name]: event.target.value })
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const { name, content } = postFormState;
        setPostFormState({ ...postFormState, isPosting: true, error: '' });

        api.submitPost(name, content)
            .then((post) => {
                setPostFormState({ ...postFormState, isPosting: false, pendingPost: post.post, paymentRequest: post.paymentRequest });
            })
            .catch((error) => {
                console.log(error, 'error message');
                setPostFormState({ ...postFormState, error: error.message, isPosting: false });
            });
    };

    let cardContent;
    if (paymentRequest) {
        cardContent = (
            <div className="PostForm-pay">
            <FormGroup>
                <Input
                value={paymentRequest}
                type="textarea"
                rows="5"
                disabled
                />
            </FormGroup>
            <Button color="primary" block href={`lightning:${paymentRequest}`}>
                Open in Wallet
            </Button>
            </div>
        );
    }
    else{
        cardContent = (
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                <Input
                    name="name"
                    value={name}
                    placeholder="Name"
                    onChange={handleChange}
                />
                </FormGroup>
    
                <FormGroup>
                <Input
                    name="content"
                    value={content}
                    type="textarea"
                    rows="5"
                    placeholder="Content (1 sat per character)"
                    onChange={handleChange}
                />
                </FormGroup>
    
                {error && (
                <Alert color="danger">
                    <h4 className="alert-heading">Failed to submit post</h4>
                    <p>{error}</p>
                </Alert>
                )}
    
                <Button color="primary" size="lg" type="submit" block disabled={disabled}>
                {isPosting ? (
                    <Spinner size="sm" />
                ) : (
                    <>Submit <small>({content.length} sats)</small></>
                )}
                </Button>
            </Form>
        );
    }
    return (
        <Card className='mb-4'>
            <CardHeader>Submit a Post</CardHeader>
            <CardBody>{cardContent}</CardBody>
        </Card>
    );
}

export default PostForm;