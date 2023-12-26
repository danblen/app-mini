import React from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image, ScrollView } from "@tarojs/components";

const ImageList = ({ images, loadMore }) => {
  const handleScrollToLower = () => {
    loadMore();
  };
  // no following code don't work, because images is not a react state
  // if (!images || images.length === 0) {
  //   return <Text>图片加载中...</Text>; // 或其他占位内容
  // }
  return (
    <ScrollView
      scrollY
      style="height: 100%;" // 确保滚动视图占满容器
      onScrollToLower={handleScrollToLower}
    >
      <View className="image-list">
        {images?.map((image, index) => (
          <View
            style={{
              paddingLeft: "10rpx",
              display: "inline-block",
            }}
            key={index}
          >
            <Image
              className="image"
              src={image}
              mode="widthFix"
              style={{
                width: "360rpx",
                borderRadius: "10rpx",
              }}
              onClick={() => {
                Taro.previewImage({
                  current: image,
                  urls: images.map((image) => image),
                });
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ImageList;
