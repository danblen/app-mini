import { View, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState, useEffect, useRef } from 'react';
import { AtIcon } from 'taro-ui';

export default ({ images }) => {
  const timersRef = useRef({});
  useEffect(() => {
    return () => {
      Object.keys(timersRef.current).forEach((key) => {
        clearInterval(timersRef.current[key]);
      });
    };
  }, []);
  return (
    <View
      style={{
        background: 'black',
        height: '100vh',
        color: '#fff',
        paddingTop: 40,
      }}
    >
      <View
        style={{
          background: 'black',
          paddingTop: '20rpx',
          marginBottom: '20rpx',
          marginLeft: '15rpx',
        }}
        onClick={() => {
          Taro.reLaunch({
            url: '/pages/album/index',
          });
        }}
      >
        作品集
        <AtIcon value="chevron-right" size="22" />
      </View>

      <ScrollView
        style={{
          background: 'black',
        }}
      >
        <View
          style={{
            background: 'black',
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              width: '96%',
            }}
          >
            {images?.map((image) => (
              <>
                {image.status === 'pending' ? (
                  <View
                    style={{
                      width: '49%',
                      height: '280rpx',
                      marginBottom: 6,
                      borderRadius: '10rpx',
                    }}
                  >
                    {/* <Loading /> */}
                    <View>制作中</View>
                  </View>
                ) : (
                  <Image
                    style={{
                      width: '49%',
                      marginBottom: 6,
                      borderRadius: '10rpx',
                    }}
                    src={image.src}
                    mode="widthFix"
                    onClick={() => {
                      Taro.previewImage({
                        current: image.src,
                        urls: images.map((image) => image.src),
                      });
                    }}
                  />
                )}
              </>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
