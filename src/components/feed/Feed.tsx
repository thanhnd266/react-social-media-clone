import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@base/store';
import PostCard from '@components/feed/Post';
import Share from '@components/feed/Share';
import { selectRandomPosts } from '@helpers/selectors/APIRequestSelector';
import axiosClient from '@base/config/axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';


export default function Feed() {
  // const posts = useAppSelector(selectRandomPosts);
  const accessToken = Cookies.get("access_token");
  const [listPost, setListPost] = useState<any>();
  const navigate = useNavigate();
  
  useEffect(() => {
    const getListPost = async () => {
      try {
        const res = await axiosClient.get(`${process.env.REACT_APP_BASE_URL_API}/api/recent`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + accessToken
          }
        });
        
        if(res.status === 401) {
          navigate("/sign-in");
        }
        if(res.status === 200) {
          setListPost(res?.data?.topics);
        }
      } catch(err: any) {
        if(err?.status === 401) {
          navigate("/sign-in");
        }
        console.log(err);
      }
    }
    getListPost();
  }, [])

  console.log(listPost);

  return listPost?.length > 0 ? (
    <Box
      display="flex"
      flexDirection="column"
      p={3}
      className="w-full"
    >
      <Share />

      {listPost.map((post: any, index: any) => (
        <PostCard
          key={post.uid}
          post={post}
          index={index}
        />
      ))}
    </Box>
  ) : null;
}
