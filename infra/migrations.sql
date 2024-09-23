CREATE TABLE IF NOT EXISTS post (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    author_name CHAR(30) NOT NULL COMMENT '작성자 이름',
    password_hash VARCHAR(255) NOT NULL COMMENT 'encrypt=true; 비밀번호',
    status CHAR(30) DEFAULT 'ACTIVE' COMMENT '게시글 상태 (ACTIVE: 활성, DELETED: 삭제됨)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_title_author (title, author_name),
    INDEX idx_author (author_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글';
