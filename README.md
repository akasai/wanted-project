## Description

댓글 기능이 있는 익명 게시판 및 키워드 알림 기능을 구현한 [Nest](https://github.com/nestjs/nest)기반의 서버입니다.

### 구현내용

1. 게시글 작성, 수정, 목록 삭제 API 
2. 댓글 목록, 삭제 API
3. [댓글 알림](./src/common/alarm/alarm.service.ts)은 구현 제외; (`console.log`로 대체했습니다.)
4. [캐싱 구현](./src/app.module.ts)은 추가적인 리소스는 사용하지 않고 `In-Memory`로 대신하였습니다.

### Swagger Documentation Page

[SwaggerPage](http://localhost:3000/api)를 통해 API테스트가 가능합니다.

아래 Project setup이 끝난 후 실행시키면 됩니다.

## Project setup

### 1. Dependency Install

```bash
$ yarn install
```

### 2. Database Setup

```bash
$ yarn db:start
```

`docker-compose`를 통해 Database(MySQL)를 구동합니다.

Up-time은 약 50초 정도 소요되며, Dummy-Data가 자동으로 세팅됩니다. 

volume은 프로젝트 폴더 내 `./db`폴더에 세팅됩니다. (DB 초기화시 같이 삭제하면 됩니다.)

### 3. Database Shutdown

```bash
$ yarn db:stop
```

`docker-compose`를 통해 Database(MySQL) 컨테이너를 종료합니다.

***이 작업은 Database 초기화가 아닙니다.*** 

### 4. Database Clear

```bash
$ docker rmi infra-db # image 이름은 다를 수 있음.

$ rm -rf ./db # project root에서 실행
```

3번의 작업을 진행 후 이미지와 volume을 같이 지우면 완전 초기화됩니다. 

## Compile and run the project

```bash
# build
$ yarn build

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
