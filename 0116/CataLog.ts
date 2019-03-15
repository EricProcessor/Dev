import Express = require('express')
var axios = require('axios')
// 课程列表数据
var queryLessons = {
    "lessons": [
        {
            "attaches": [
                {
                    "attribute": "mcworld",
                    "creator": 1,
                    "id": 8,
                    "name": "Lesson1_CN.mcworld",
                    "status": 1,
                    "type": "mcworld",
                    "uri": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson1/Lesson1_CN.mcworld"
                }
            ],
            "categoryId": 1,
            "chapterId": 0,
            "courseId": 1,
            "id": 1,
            "subtitle": "通过编程改变你的Minecraft世界",
            "thumbnail": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson1.png",
            "title": "第1课:编程实现对话和传送代理机器人",
            "trial": 0,
            "updateTime": "2018-10-22T17:06:02.228Z"
        },
        {
            "attaches": [
                {
                    "attribute": "mcworld",
                    "creator": 1,
                    "id": 13,
                    "name": "Lesson2_CN.mcworld",
                    "status": 1,
                    "type": "mcworld",
                    "uri": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson2/Lesson2_CN.mcworld"
                }
            ],
            "categoryId": 1,
            "chapterId": 0,
            "courseId": 1,
            "id": 2,
            "subtitle": "通过编程让代理移动",
            "thumbnail": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson2.png",
            "title": "第2课:编程实现代理转向和移动",
            "trial": 0,
            "updateTime": "2018-10-23T17:06:02.228Z"
        },
        {
            "attaches": [
                {
                    "attribute": "mcworld",
                    "creator": 1,
                    "id": 18,
                    "name": "Lesson3_CN.mcworld",
                    "status": 1,
                    "type": "mcworld",
                    "uri": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson3/Lesson3_CN.mcworld"
                }
            ],
            "categoryId": 1,
            "chapterId": 0,
            "courseId": 1,
            "id": 3,
            "subtitle": "多人模式挑战",
            "thumbnail": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson3.png",
            "title": "第3课:多人模式挑战",
            "trial": 0,
            "updateTime": "2018-10-24T17:06:02.228Z"
        }
    ]
}
// 第一课数据
var drateLessons1 = {
    "lesson": {
        "attaches": [
            {
                "attribute": "mcworld",
                "creator": 1,
                "id": 8,
                "name": "Lesson1_CN.mcworld",
                "status": 1,
                "type": "mcworld",
                "uri": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson1/Lesson1_CN.mcworld"
            }
        ],
        "categoryId": 1,
        "chapterId": 0,
        "courseId": 1,
        "id": 1,
        "subtitle": "通过编程改变你的Minecraft世界",
        "thumbnail": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson1.png",
        "title": "第1课:编程实现对话和传送代理机器人",
        "trial": 0,
        "updateTime": "2018-10-22T17:06:02.228Z"
    }
}
// 第二课数据
var drateLessons2 = {
    "lesson": {
        "attaches": [
            {
                "attribute": "mcworld",
                "creator": 1,
                "id": 13,
                "name": "Lesson2_CN.mcworld",
                "status": 1,
                "type": "mcworld",
                "uri": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson2/Lesson2_CN.mcworld"
            }
        ],
        "categoryId": 1,
        "chapterId": 0,
        "courseId": 1,
        "id": 2,
        "subtitle": "通过编程让代理移动",
        "thumbnail": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson2.png",
        "title": "第2课:编程实现代理转向和移动",
        "trial": 0,
        "updateTime": "2018-10-23T17:06:02.228Z"
    }
}
// 第三课数据
var drateLessons3 = {
    "lesson": {
        "attaches": [
            {
                "attribute": "mcworld",
                "creator": 1,
                "id": 18,
                "name": "Lesson3_CN.mcworld",
                "status": 1,
                "type": "mcworld",
                "uri": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson3/Lesson3_CN.mcworld"
            }
        ],
        "categoryId": 1,
        "chapterId": 0,
        "courseId": 1,
        "id": 3,
        "subtitle": "多人模式挑战",
        "thumbnail": "https://minecraft-oss.oss.cn-north-1.jcloudcs.com/demo/lesson3.png",
        "title": "第3课:多人模式挑战",
        "trial": 0,
        "updateTime": "2018-10-24T17:06:02.228Z"
    }
}
// 课程列表请求java接口
export async function InterfaceQuery(req, res) {
    // axios.get('https://minecraft.education.jdcloud.com/getUserInfo', {
    //     params: { id: "test190117" }
    // })
    //     .then(function (res1) {
    //         res.send(JSON.stringify(res1.data))
    //     }).catch(function (error) {
    //         console.log(error);
    //     });
    const data = queryLessons.lessons //请求的lessons数据
    let ProductIds = [];  //数据ID
    let Products = [];  //类表数据
    let attaches // 类表数据-下载相关
    for (var i in data) {
        // ProductIds.push(data[i].id)
        ProductIds[i] = data[i].id;
        attaches = data[i].attaches;
        Products[i] = {
            "LastModifiedDate": data[i].updateTime,
            "LocalizedProperties": [
                {
                    "Images": [
                        {
                            "ImagePurpose": "logo",
                            "Uri": data[i].thumbnail
                        }
                    ],
                    "Language": "en",
                    "ProductSubtitle": data[i].subtitle,
                    "Contributors": [
                        {
                            "ContributorId": "1",
                            "Name": null,
                            "RoleType": "creator",
                            "Order": 0
                        }
                    ],
                    "SearchKeywords": [
                        "MustHave"
                    ],
                    "ProductDescription": (data[i].description ? data[i].description : null),
                    "ProductTitle": data[i].title,
                    "Markets": [
                        "US",
                        "NEUTRAL"
                    ]
                }
            ],
            "ProductId": data[i].id,
            "DisplaySkuAvailabilities": [
                {
                    "Sku": {
                        "LastModifiedDate": (attaches.updateTime ? attaches.updateTime : null),
                        "MarketProperties": [
                            {
                                "FulFillmentServiceData": [
                                    {
                                        "ResourceDownloadUri": attaches.uri,
                                        "ResourceId": attaches.id,
                                        "ResourceType": attaches.type,
                                        "ResourceFormat": "mcworld"
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    }
    // 输出数据
    let backOut = {
        "ProductIds": ProductIds,
        "HasMorePages": false,
        "Products": Products,
        "TotalResultCount": ProductIds.length
    }

    res.send(JSON.stringify(backOut))


}
// 商品详情请求java接口
export async function InterfaceHydrate(req, res) {
    var aid = req.params.id;
    // axios.get('http://minecraft.jd.com/material/mee/hydrate')
    //     .then(function (response) {
    //         res.send(JSON.stringify(response))

    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //     });

    let data
    if (aid == 1) {
        data = drateLessons1.lesson;
    } else if (aid == 2) {
        data = drateLessons2.lesson;
    } else if (aid == 3) {
        data = drateLessons3.lesson;
    }

    let Product;  //详情数据
    let attaches = data.attaches[0]; //详情数据-下载相关
    //详情数据
    Product = {
        "LastModifiedDate": data.updateTime,
        "LocalizedProperties": [
            {
                "Images": [
                    {
                        "ImagePurpose": "logo",
                        "Uri": data.thumbnail
                    }
                ],
                "Language": "en",
                "ProductSubtitle": data.subtitle,
                "Contributors": [
                    {
                        "ContributorId": "1",
                        "Name": null,
                        "RoleType": "creator",
                        "Order": 0
                    }
                ],
                "SearchKeywords": [
                    "MustHave"
                ],
                "ProductDescription": (data.description ? data.description : null),
                "ProductTitle": data.title,
                "Markets": [
                    "US",
                    "NEUTRAL"
                ]
            }
        ],
        "ProductId": data.id,
        "DisplaySkuAvailabilities": [
            {
                "Sku": {
                    "LastModifiedDate": (attaches.updateTime ? attaches.updateTime : null),
                    "MarketProperties": [
                        {
                            "FulFillmentServiceData": [
                                {
                                    "ResourceDownloadUri": attaches.uri,
                                    "ResourceId": attaches.id,
                                    "ResourceType": attaches.type,
                                    "ResourceFormat": "mcworld"
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
    //接口传出数据
    let backOut = {
        "Product": Product
    }
    res.send(JSON.stringify(backOut))
}