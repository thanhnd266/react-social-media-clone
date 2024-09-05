import { Box } from '@mui/system';
import React, { useEffect } from 'react';
import { useAppSelector } from '@base/store';
import PostCard from '@components/feed/Post';
import Share from '@components/feed/Share';
import { selectRandomPosts } from '@helpers/selectors/APIRequestSelector';
import axiosClient from '@base/config/axios';
import Cookies from 'js-cookie';

export default function Feed() {
  const posts = useAppSelector(selectRandomPosts);
  const accessToken = Cookies.get("access_token");
  
  useEffect(() => {
    const getListPost = async () => {
      try {
        const res = await axiosClient.get(`${process.env.REACT_APP_BASE_URL_API}/api/popular`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + accessToken
          }
        });
  
        console.log(res);
      } catch(err) {
        console.log(err);
      }
    }
    getListPost();
  }, [])

  return posts ? (
    <Box
      display="flex"
      flexDirection="column"
      p={3}
      className="w-full"
    >
      <Share />

      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          index={index}
        />
      ))}
    </Box>
  ) : null;
}
