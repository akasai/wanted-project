CREATE TABLE IF NOT EXISTS post (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    author_name CHAR(30) NOT NULL COMMENT '작성자 이름',
    password_hash VARCHAR(255) NOT NULL COMMENT 'encrypt=true; 비밀번호',
    status CHAR(30) DEFAULT 'ACTIVE' COMMENT '게시글 상태 (ACTIVE: 활성, DELETED: 삭제됨)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_id_author_status (id, author_name, status),
    INDEX idx_title_author (title, author_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글';

CREATE TABLE IF NOT EXISTS comments (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    post_id INT(11) NOT NULL COMMENT '게시물 ID (FK)',
    parent_id INT(11) DEFAULT NULL COMMENT '부모 댓글 ID',
    content TEXT NOT NULL COMMENT '댓글 내용',
    author_name CHAR(30) NOT NULL COMMENT '작성자 이름',
    password_hash VARCHAR(255) NOT NULL COMMENT 'encrypt=true; 비밀번호',
    status CHAR(30) DEFAULT 'ACTIVE' COMMENT '게시글 상태 (ACTIVE: 활성, DELETED: 삭제됨)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_post_id (post_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='댓글';
