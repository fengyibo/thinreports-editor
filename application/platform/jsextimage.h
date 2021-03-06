/****************************************************************************
**
** Copyright (C) 2011 Matsukei Co.,Ltd.
**
** This program is free software: you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation, either version 3 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program.  If not, see <http://www.gnu.org/licenses/>.
**
****************************************************************************/

#ifndef JSEXTIMAGE_H
#define JSEXTIMAGE_H

#include <QWidget>

class JsExtImage : public QWidget
{
    Q_OBJECT

public:
    explicit JsExtImage(QWidget *parent = 0);

signals:

public slots:
    QString encodeBase64(const QString &fileName);
    int getWidth(const QString &fileName);
    int getHeight(const QString &fileName);
};

#endif // JSEXTIMAGE_H
