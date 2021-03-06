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

#include "jsextimage.h"
#include <QFile>
#include <QByteArray>
#include <QBuffer>
#include <QImage>


JsExtImage::JsExtImage(QWidget *parent) :
    QWidget(parent)
{
}

QString JsExtImage::encodeBase64(const QString &fileName)
{
    if (!fileName.isEmpty()) {
        QFile* file = new QFile(fileName);
        file->open((QIODevice::ReadOnly));
        QByteArray image = file->readAll();

        return image.toBase64();
    }
    return "";
}

int JsExtImage::getWidth(const QString &fileName)
{
    return QImage(fileName).width();
}

int JsExtImage::getHeight(const QString &fileName)
{
    return QImage(fileName).height();
}
